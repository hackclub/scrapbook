import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { genericOAuth } from 'better-auth/plugins'
import prisma from './prisma'
import { IDENTITY_PROVIDER_ID, IDENTITY_SCOPES } from './auth-constants'

let _auth = null

function identityHost() {
  return (process.env.HC_IDENTITY_HOST || process.env.IDENTITY_URL || 'https://auth.hackclub.com').replace(/\/+$/, '')
}

function toStringOrNull(value) {
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

function identityName(identity) {
  const firstName = toStringOrNull(identity?.first_name) || ''
  const lastName = toStringOrNull(identity?.last_name) || ''
  return `${firstName} ${lastName}`.trim() || toStringOrNull(identity?.name) || toStringOrNull(identity?.primary_email) || ''
}

function usernameBase(name, email) {
  const source = name || email?.split('@')[0] || 'scrapbooker'
  return source
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 36) || 'scrapbooker'
}

async function uniqueUsername(name, email) {
  const base = usernameBase(name, email)
  let candidate = base
  let suffix = 1

  while (await prisma.accounts.findUnique({ where: { username: candidate }, select: { id: true } })) {
    suffix += 1
    candidate = `${base}-${suffix}`
  }

  return candidate
}

async function consolidateIdentityAccount(identity) {
  const email = toStringOrNull(identity?.primary_email)?.toLowerCase()
  const slackID = toStringOrNull(identity?.slack_id)
  const identityId = toStringOrNull(identity?.id)
  const name = identityName(identity)
  const avatar = toStringOrNull(identity?.avatar_url)
  const verificationStatus = toStringOrNull(identity?.verification_status)

  if (!email) return null

  const [accountWithEmail, accountWithSlackID] = await Promise.all([
    prisma.accounts.findUnique({ where: { email } }),
    slackID ? prisma.accounts.findUnique({ where: { slackID } }) : null
  ])

  const profile = {
    email,
    emailVerified: new Date(),
    authEmailVerified: true,
    name,
    identityId,
    slackID,
    avatar,
    verificationStatus
  }

  if (accountWithEmail && accountWithSlackID && accountWithEmail.id !== accountWithSlackID.id) {
    if (accountWithSlackID.email && accountWithSlackID.email !== email) {
      return prisma.accounts.update({
        where: { id: accountWithEmail.id },
        data: {
          name,
          identityId,
          slackID: accountWithEmail.slackID || slackID,
          avatar,
          verificationStatus,
          authEmailVerified: true,
          emailVerified: accountWithEmail.emailVerified || new Date()
        }
      })
    }

    return prisma.$transaction(async tx => {
      await tx.updates.updateMany({
        where: { accountsID: accountWithEmail.id },
        data: {
          accountsID: accountWithSlackID.id,
          accountsSlackID: slackID
        }
      })

      await tx.session.updateMany({
        where: { userId: accountWithEmail.id },
        data: { userId: accountWithSlackID.id }
      })

      const [emailMemberships, slackMemberships] = await Promise.all([
        tx.clubMember.findMany({ where: { accountId: accountWithEmail.id } }),
        tx.clubMember.findMany({ where: { accountId: accountWithSlackID.id } })
      ])
      const slackMembershipByClub = new Map(slackMemberships.map(membership => [membership.clubId, membership]))

      for (const membership of emailMemberships) {
        const existing = slackMembershipByClub.get(membership.clubId)
        if (existing) {
          if (membership.admin && !existing.admin) {
            await tx.clubMember.update({ where: { id: existing.id }, data: { admin: true } })
          }
          await tx.clubMember.delete({ where: { id: membership.id } })
        } else {
          await tx.clubMember.update({
            where: { id: membership.id },
            data: { accountId: accountWithSlackID.id }
          })
        }
      }

      await tx.accounts.delete({ where: { id: accountWithEmail.id } })
      return tx.accounts.update({
        where: { id: accountWithSlackID.id },
        data: profile
      })
    })
  }

  const existing = accountWithSlackID || accountWithEmail
  if (!existing) return null

  return prisma.accounts.update({
    where: { id: existing.id },
    data: {
      ...profile,
      slackID: existing.slackID || slackID,
      name: name || existing.name || existing.username
    }
  })
}

async function fetchIdentity(accessToken) {
  const response = await fetch(`${identityHost()}/api/v1/me`, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  })

  if (!response.ok) return null
  const data = await response.json()
  return data?.identity || null
}

function createAuth() {
  const host = identityHost()
  const clientId = process.env.HC_IDENTITY_CLIENT_ID || process.env.IDENTITY_CLIENT_ID
  const clientSecret = process.env.HC_IDENTITY_CLIENT_SECRET || process.env.IDENTITY_CLIENT_SECRET

  return betterAuth({
    baseURL: process.env.BETTER_AUTH_URL || process.env.NEXTAUTH_URL,
    basePath: '/api/auth',
    secret: process.env.BETTER_AUTH_SECRET || process.env.TOKEN_SECRET,
    database: prismaAdapter(prisma, {
      provider: 'postgresql'
    }),
    user: {
      modelName: 'accounts',
      fields: {
        emailVerified: 'authEmailVerified'
      },
      additionalFields: {
        username: { type: 'string', required: false },
        slackID: { type: 'string', required: false, fieldName: 'slackID' },
        identityId: { type: 'string', required: false, fieldName: 'identityId' },
        verificationStatus: { type: 'string', required: false, fieldName: 'verificationStatus' },
        avatar: { type: 'string', required: false, fieldName: 'avatar' },
        legacyEmailVerified: {
          type: 'date',
          required: false,
          returned: false,
          fieldName: 'emailVerified'
        }
      }
    },
    session: {
      modelName: 'session',
      fields: {
        token: 'sessionToken',
        expiresAt: 'expires'
      },
      expiresIn: 30 * 24 * 60 * 60
    },
    account: {
      modelName: 'account',
      accountLinking: {
        enabled: true,
        trustedProviders: [IDENTITY_PROVIDER_ID],
        requireLocalEmailVerified: false
      }
    },
    verification: {
      modelName: 'verification'
    },
    emailAndPassword: {
      enabled: false
    },
    databaseHooks: {
      user: {
        create: {
          before: async user => ({
            data: {
              username: await uniqueUsername(user.name, user.email),
              legacyEmailVerified: user.emailVerified ? new Date() : null
            }
          })
        },
        update: {
          before: async user => ({
            data: {
              legacyEmailVerified: user.emailVerified ? new Date() : undefined
            }
          })
        }
      }
    },
    plugins: [
      genericOAuth({
        config: [
          {
            providerId: IDENTITY_PROVIDER_ID,
            clientId,
            clientSecret,
            discoveryUrl: `${host}/.well-known/openid-configuration`,
            scopes: IDENTITY_SCOPES,
            overrideUserInfo: true,
            getToken: async ({ code, redirectURI }) => {
              const response = await fetch(`${host}/oauth/token`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({
                  client_id: clientId,
                  client_secret: clientSecret,
                  code,
                  redirect_uri: redirectURI,
                  grant_type: 'authorization_code'
                })
              })
              const data = await response.json()

              if (!response.ok) {
                throw new Error(data?.error || 'Hack Club Auth token exchange failed')
              }

              const identity = await fetchIdentity(data.access_token)
              await consolidateIdentityAccount(identity)

              return {
                accessToken: data.access_token,
                refreshToken: data.refresh_token,
                idToken: data.id_token,
                accessTokenExpiresAt: data.expires_in
                  ? new Date(Date.now() + data.expires_in * 1000)
                  : undefined,
                raw: {
                  ...data,
                  identity
                }
              }
            },
            getUserInfo: async tokens => {
              const identity = tokens.raw?.identity || await fetchIdentity(tokens.accessToken)
              const email = toStringOrNull(identity?.primary_email)?.toLowerCase()
              const id = toStringOrNull(identity?.id)

              if (!identity || !email || !id) return null

              return {
                id,
                email,
                emailVerified: true,
                name: identityName(identity),
                image: toStringOrNull(identity?.avatar_url) || undefined,
                slackID: toStringOrNull(identity?.slack_id),
                identityId: id,
                verificationStatus: toStringOrNull(identity?.verification_status),
                avatar: toStringOrNull(identity?.avatar_url),
                legacyEmailVerified: new Date()
              }
            }
          }
        ]
      })
    ]
  })
}

export function getAuth() {
  if (!_auth) _auth = createAuth()
  return _auth
}

export const auth = getAuth()
