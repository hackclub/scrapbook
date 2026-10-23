import { afterEach, expect, mock, spyOn, test } from 'bun:test'
import { parseUserInput } from 'better-auth/db'
import { postLimit } from '../apps/web/lib/pagination'
import { requireMutation } from '../apps/web/lib/request-security'
import { publicProfile } from '../apps/web/lib/public-profile'
import { profileInput } from '../apps/web/lib/profile-input'
import { ownedUploadKey } from '../apps/web/lib/uploads'
import { enrichPublicProfile, profileAvatar } from '../apps/web/lib/cachet'

let currentSession: any = null
const database = {
  club: {
    findFirst: mock(async () => ({ id: 'club-a', customDomain: null })),
    update: mock(async args => args.data)
  },
  clubMember: { deleteMany: mock(async () => ({ count: 0 })) },
  accounts: {
    findUnique: mock(async () => null),
    create: mock(async args => args.data),
    findFirst: mock(async () => ({ id: 'me', customDomain: null })),
    update: mock(async args => args.data)
  }
}
mock.module('../apps/web/lib/prisma', () => ({ default: database }))
mock.module('../apps/web/lib/auth-session', () => ({
  requireServerAuthSession: async (req, res) => {
    if (!requireMutation(req, res)) return null
    if (!currentSession) {
      res.status(401).json({ error: true })
      return null
    }
    return currentSession
  }
}))
const { default: editClub } =
  await import('../apps/web/pages/api/web/clubs/[id]/edit')
const { default: removeMember } =
  await import('../apps/web/pages/api/web/clubs/[id]/remove-member')
const { default: editProfile } =
  await import('../apps/web/pages/api/web/profile/edit')
const originalFetch = globalThis.fetch

afterEach(() => {
  globalThis.fetch = originalFetch
  currentSession = null
  for (const model of Object.values(database))
    for (const method of Object.values(model)) method.mockClear()
})
function response() {
  return {
    headers: new Map(),
    code: 200,
    body: undefined as any,
    setHeader(name, value) {
      this.headers.set(name, value)
    },
    status(code) {
      this.code = code
      return this
    },
    json(body) {
      this.body = body
      return this
    }
  }
}
function request(overrides = {}) {
  return {
    method: 'POST',
    headers: {
      host: 'scrapbook.test',
      origin: 'https://scrapbook.test',
      'content-type': 'application/json'
    },
    query: { id: 'club-a' },
    body: {},
    ...overrides
  }
}

for (const req of [
  request({ method: 'GET' }),
  request({
    headers: {
      host: 'scrapbook.test',
      origin: 'https://evil.test',
      'content-type': 'application/json'
    }
  }),
  request({
    headers: { host: 'scrapbook.test', 'content-type': 'text/plain' }
  }),
  request({
    headers: {
      host: 'scrapbook.test',
      'content-type': 'application/x-www-form-urlencoded'
    }
  }),
  request({
    headers: {
      host: 'scrapbook.test',
      'content-type': 'application/json',
      'sec-fetch-site': 'same-site'
    }
  })
])
  test('cookie-authenticated mutation rejects unsafe methods and cross-site requests', () => {
    expect(requireMutation(req, response())).toBe(false)
  })

test('same-origin JSON mutations are permitted', () => {
  expect(requireMutation(request(), response())).toBe(true)
})

test('club edits reject signed-in non-admins before database or domain calls', async () => {
  currentSession = {
    user: { id: 'me', ClubMember: [{ clubId: 'club-a', admin: false }] }
  }
  const fetcher = spyOn(globalThis, 'fetch').mockRejectedValue(
    new Error('Must not call Vercel')
  )
  const res = response()
  await editClub(
    request({ body: { id: 'club-a', customDomain: 'evil.test' } }),
    res
  )
  expect(res.code).toBe(403)
  expect(database.club.findFirst).not.toHaveBeenCalled()
  expect(database.club.update).not.toHaveBeenCalled()
  expect(fetcher).not.toHaveBeenCalled()
})

test('club edit uses route id and excludes nested membership and post writes', async () => {
  currentSession = {
    user: { id: 'me', ClubMember: [{ clubId: 'club-a', admin: true }] }
  }
  const res = response()
  await editClub(
    request({
      body: {
        id: 'victim-club',
        name: 'My club',
        members: { deleteMany: {} },
        updates: { deleteMany: {} }
      }
    }),
    res
  )
  expect(res.code).toBe(200)
  const update = database.club.update.mock.calls[0][0]
  expect(update.where).toEqual({ id: 'club-a' })
  expect(update.data.members).toBeUndefined()
  expect(update.data.updates).toBeUndefined()
  expect(update.data.id).toBeUndefined()
})

test('member deletion is constrained to the club the caller administers', async () => {
  currentSession = {
    user: { id: 'me', ClubMember: [{ clubId: 'club-a', admin: true }] }
  }
  const res = response()
  await removeMember(request({ body: { member: 'membership-in-club-b' } }), res)
  expect(database.clubMember.deleteMany.mock.calls[0][0].where).toEqual({
    id: 'membership-in-club-b',
    clubId: 'club-a'
  })
  expect(res.code).toBe(404)
})

test('profile editing cannot replace identity-owned email', async () => {
  currentSession = { user: { id: 'me' } }
  const res = response()
  await editProfile(
    request({
      body: {
        username: 'myname',
        email: 'victim@example.test',
        verificationStatus: 'verified',
        slackID: 'UVICTIM'
      }
    }),
    res
  )
  expect(res.code).toBe(200)
  const data = database.accounts.update.mock.calls[0][0].data
  expect(data.email).toBeUndefined()
  expect(data.verificationStatus).toBeUndefined()
  expect(data.slackID).toBeUndefined()
})

test('public profiles never include private or future account fields', () => {
  const result = publicProfile({
    username: 'test',
    avatar: 'https://example.test/photo.png',
    email: 'private@example.test',
    identityId: 'private',
    webhookURL: 'https://private.test/token',
    verificationStatus: 'verified',
    timezone: 'private',
    futureSecret: 'private',
    authAccounts: [{ accessToken: 'private' }]
  })
  expect(result).toEqual({
    username: 'test',
    avatar: 'https://example.test/photo.png'
  })
})

for (const body of [
  { website: 'javascript:alert(1)?https://example.com' },
  { website: 'data:text/html,hello' },
  { avatar: 'file:///etc/hostname' },
  { cssURL: 'https://attacker.test/style.css' },
  { customDomain: 'a.test&teamId=evil' }
])
  test('profile URL validation rejects executable and untrusted destinations', () => {
    expect(() => profileInput(body)).toThrow()
  })

test('attachment cleanup cannot delete another user or legacy object', () => {
  const base = 'https://scrapbook-into-the-redwoods.s3.amazonaws.com/'
  expect(ownedUploadKey(base + 'web/me/file.png', 'me')).toBe('web/me/file.png')
  for (const url of [
    base + 'web/victim/file.png',
    base + 'legacy.png',
    'https://amazonaws.com.attacker.test/web/me/file.png',
    base + 'web/me/%2e%2e/victim.png'
  ]) {
    expect(ownedUploadKey(url, 'me')).toBeNull()
  }
})

test('Cachet replaces Slack-hosted avatars and preserves custom uploads', () => {
  expect(
    profileAvatar({
      slackID: 'U0123456789',
      avatar: 'https://avatars.slack-edge.com/old.png'
    })
  ).toBe('https://cachet.hackclub.com/users/U0123456789/r')
  expect(
    profileAvatar({
      slackID: 'U0123456789',
      avatar: 'https://example.test/custom.png'
    })
  ).toBe('https://example.test/custom.png')
})

test('Cachet enrichment is cached, uses public fields, and preserves chosen pronouns', async () => {
  const fetcher = spyOn(globalThis, 'fetch').mockResolvedValue(
    new Response(
      JSON.stringify({
        userId: 'U1111111111',
        displayName: 'Cached name',
        pronouns: 'they/them',
        realName: 'Private',
        email: 'private'
      })
    )
  )
  const profile = {
    username: 'local-name',
    slackID: 'U1111111111',
    pronouns: 'she/her'
  }
  const result = await enrichPublicProfile(profile)
  expect(result).toEqual({ ...profile, displayName: 'Cached name' })
  await enrichPublicProfile(profile)
  expect(fetcher).toHaveBeenCalledTimes(1)
  expect(fetcher.mock.calls[0][0]).toBe(
    'https://cachet.hackclub.com/users/U1111111111'
  )
})

test('Cachet placeholders and outages preserve the local profile', async () => {
  spyOn(globalThis, 'fetch')
    .mockResolvedValueOnce(new Response('{}', { status: 202 }))
    .mockRejectedValueOnce(new Error('offline'))
  for (const slackID of ['U2222222222', 'U3333333333']) {
    const profile = { username: 'local-name', slackID, pronouns: 'they/them' }
    expect(await enrichPublicProfile(profile)).toEqual(profile)
  }
})

test('member removal rejects a missing id rather than deleting every membership', async () => {
  currentSession = {
    user: { id: 'me', ClubMember: [{ clubId: 'club-a', admin: true }] }
  }
  const res = response()
  await removeMember(request(), res)
  expect(res.code).toBe(400)
  expect(database.clubMember.deleteMany).not.toHaveBeenCalled()
})

test('public post limits bound oversized, negative and fractional input', () => {
  expect(postLimit('100000000')).toBe(300)
  expect(postLimit('-10')).toBe(200)
  expect(postLimit('Infinity')).toBe(200)
  expect(postLimit('0.5')).toBe(1)
})

test('Better Auth rejects client identity escalation while first login persists trusted identity', async () => {
  const previousRedirect = process.env.IDENTITY_REDIRECT_URI
  process.env.IDENTITY_REDIRECT_URI =
    'http://localhost/api/auth/callback/hackclub-identity'
  try {
    const { auth, consolidateIdentityAccount } =
      await import('../apps/web/lib/auth')
    for (const [field, value] of Object.entries({
      slackID: 'U0123456789',
      identityId: 'identity',
      verificationStatus: 'verified',
      legacyEmailVerified: new Date(),
      username: 'victim'
    })) {
      expect(() =>
        parseUserInput(auth.options, { [field]: value }, 'update')
      ).toThrow()
    }
    const account = await consolidateIdentityAccount({
      id: 'identity',
      primary_email: 'me@example.test',
      slack_id: 'U0123456789',
      verification_status: 'verified',
      first_name: 'Test'
    })
    expect(account.slackID).toBe('U0123456789')
    expect(account.verificationStatus).toBe('verified')
    expect(account.authEmailVerified).toBe(true)
    expect(database.accounts.create).toHaveBeenCalledTimes(1)
  } finally {
    if (previousRedirect === undefined) delete process.env.IDENTITY_REDIRECT_URI
    else process.env.IDENTITY_REDIRECT_URI = previousRedirect
  }
})
