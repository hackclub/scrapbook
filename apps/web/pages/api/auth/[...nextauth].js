import NextAuth from 'next-auth'
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from '../../../lib/prisma'
import metrics from "../../../metrics";

function PrismaAdapter(p) {
  return {
    createUser: data =>
      p.accounts.create({ data: { username: data.email, ...data } }),
    getUser: id =>
      p.accounts.findUnique({ where: { id }, include: { ClubMember: true } }),
    getUserByEmail: email =>
      p.accounts.findUnique({
        where: { email },
        include: { ClubMember: true }
      }),
    async getUserByAccount(provider_providerAccountId) {
      var _a
      const account = await p.webAccounts.findUnique({
        where: { provider_providerAccountId },
        select: { user: true },
        include: { ClubMember: true }
      })
      return (_a =
        account === null || account === void 0 ? void 0 : account.user) !==
        null && _a !== void 0
        ? _a
        : null
    },
    updateUser: ({ id, ...data }) => p.accounts.update({ where: { id }, data }),
    deleteUser: id => p.accounts.delete({ where: { id } }),
    linkAccount: data =>
      p.webAccounts.create({ data: { ...data, username: data.email } }),
    unlinkAccount: provider_providerAccountId =>
      p.webAccounts.delete({
        where: { provider_providerAccountId }
      }),
    async getSessionAndUser(sessionToken) {
      const userAndSession = await p.session.findUnique({
        where: { sessionToken },
        include: {
          user: {
            include: {
              ClubMember: {
                include: {
                  club: true
                }
              }
            }
          }
        }
      })
      if (!userAndSession) return null
      const { user, ...session } = userAndSession
      return { user, session }
    },
    createSession: data => p.session.create({ data }),
    updateSession: data =>
      p.session.update({ where: { sessionToken: data.sessionToken }, data }),
    deleteSession: sessionToken =>
      p.session.delete({ where: { sessionToken } }),
    async createVerificationToken(data) {
      const verificationToken = await p.verificationToken.create({ data })
      if (verificationToken.id) delete verificationToken.id
      return verificationToken
    },
    async useVerificationToken(identifier_token) {
      try {
        const verificationToken = await p.verificationToken.delete({
          where: { identifier_token }
        })
        if (verificationToken.id) delete verificationToken.id
        return verificationToken
      } catch (error) {
        if (error.code === 'P2025') return null
        throw error
      }
    }
  }
}
exports.PrismaAdapter = PrismaAdapter

export const authOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.TOKEN_SECRET,
  adapter: PrismaAdapter(prisma),
  // pages: {
  //   verifyRequest: '/?checkYourEmail',
  //   error: '/auth/error',
  //   newUser: '/new'
  // },
  pages: {
    login: "/login",
    verifyRequest: '/?checkYourEmail',
    error: '/auth/error',
    // newUser: '/new',
  },
  callbacks: {
    async session({ session, user, token }) {
      const userId = (token?.sub) ?? undefined;
      if (!userId) {
        return session;
      }

      try {
        const dbUser = await prisma.accounts.findUnique({ where: { id: userId } });

        if (dbUser) {
          return {
            ...session,
            user: { ...session.user, ...dbUser }
          };
        }
      } catch (err) {
        console.error("Error enriching session from DB:", err);
      }

      return session;
    },
    async jwt({ token, user, account, profile, isNewUser }) {
      if (user) {
        // Persist user id in token on initial sign-in
        (token).sub = (user).id;
      }
      return token;
    },
    async signIn({ user, account, profile }) {
      // Log the sign in attempt
      console.log("Sign in attempt:", {
        email: user.email,
        provider: account?.provider,
        user
      });

      if (!user.email) {
        metrics.increment("errors.sign_in", 1);
        return false;
      }

      return true;
    }
  },
  providers: [   
    CredentialsProvider({
      id: "hc-identity",
      name: "Identity",
      type: "credentials",
      credentials: {
        code: { type: "text" },
      },
      async authorize(credentials) {
        try {
          const code = credentials?.code;
          if (!code) return null;

          // Normalize identity base URL (strip trailing slashes)
          const identityBaseUrl = (process.env.IDENTITY_URL || '').replace(/\/+$/, '') || 'https://hca.dinosaurbbq.org';

          // Use the same redirect URI for both the authorize step and the token exchange
          // so the Identity provider doesn't reject the grant with `invalid_grant`.
          const redirectUri =
            process.env.IDENTITY_REDIRECT_URI ||
            `${(process.env.NEXTAUTH_URL || '').replace(/\/+$/, '')}/login`;

          // Construct token request parameters
          const tokenUrl = `${identityBaseUrl}/oauth/token`;
          const tokenParams = new URLSearchParams({
            client_id: process.env.IDENTITY_CLIENT_ID,
            client_secret: process.env.IDENTITY_CLIENT_SECRET,
            redirect_uri: redirectUri,
            grant_type: "authorization_code",
            code: code,
          }).toString();

          // Exchange code for token
          const tokenResponse = await fetch(tokenUrl, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: tokenParams,
          });

          console.log("sent token params", tokenParams, tokenUrl);

          if (!tokenResponse.ok) {
            console.error('Identity token exchange failed:', tokenResponse.status, await tokenResponse.text());
            return null;
          }

          console.log("token response", tokenResponse.status);

          const { access_token } = await tokenResponse.json();

          console.log("access token:", access_token);

          // Fetch user info from identity provider
          const userInfoResponse = await fetch(
            `${identityBaseUrl}/api/v1/me`,
            {
              headers: { Authorization: `Bearer ${access_token}` },
            },
          );
          if (!userInfoResponse.ok) {
            console.error('Identity user info fetch failed:', userInfoResponse.status, await userInfoResponse.text());
            return null;
          }

          const data = await userInfoResponse.json();
          const { identity } = data;

          console.log("identity response data ", data);
          console.log("identity ", identity);

          const email = identity?.primary_email;
          const firstName = identity?.first_name ?? "";
          const lastName = identity?.last_name ?? "";
          const name = `${firstName} ${lastName}`.trim();

          if (!email || !name) {
            console.error('Identity missing required fields:', { email, name, identity });
            return null;
          }

          // Upsert user record in database against the Accounts model
          const username = name || email;

          const account =  await consolidateScrapbookAccounts(email, identity?.slack_id)
          if (!account) {
            return await prisma.accounts.create({
              data: {
                email,
                emailVerified: new Date(),
                username: username,
                slackID: identity?.slack_id,
              }
            })
          } else {
            return account;
          }
        } catch (error) {
          console.error('Identity login error:', error);
          return null;
        }
      },
    }),
  ]
}

async function consolidateScrapbookAccounts(email, slackID) {
  const accountWithEmail = await prisma.accounts.findUnique({ where: { email } });

  // slackID is optional from identity; never query with undefined (Prisma throws).
  const accountWithSlackID = slackID
    ? await prisma.accounts.findUnique({ where: { slackID } })
    : null;

  // Already consolidated (same row matched both lookups)
  if (accountWithEmail && accountWithSlackID && accountWithEmail.id === accountWithSlackID.id) {
    if (!accountWithSlackID.emailVerified) {
      return await prisma.accounts.update({
        where: { id: accountWithSlackID.id },
        data: { emailVerified: new Date() }
      });
    }
    return accountWithSlackID;
  }

  // Can't consolidate without a slackID; still return an existing email account if present.
  if (!slackID) {
    if (accountWithEmail && !accountWithEmail.emailVerified) {
      return await prisma.accounts.update({
        where: { id: accountWithEmail.id },
        data: { emailVerified: new Date() }
      });
    }
    return accountWithEmail || null;
  }

  // Slack account exists, but no email account exists yet.
  if (!accountWithEmail && accountWithSlackID) {
    // If the slack account doesn't have an email yet, attach it.
    if (!accountWithSlackID.email) {
      return await prisma.accounts.update({
        where: { slackID },
        data: {
          email,
          emailVerified: new Date()
        }
      });
    }
    // Ensure emailVerified is set when identity login confirms the email.
    if (!accountWithSlackID.emailVerified && accountWithSlackID.email === email) {
      return await prisma.accounts.update({
        where: { id: accountWithSlackID.id },
        data: { emailVerified: new Date() }
      });
    }
    // Otherwise, don't mutate anything (could be a conflict).
    return accountWithSlackID;
  }

  // Email account exists, but no slack account exists yet.
  if (accountWithEmail && !accountWithSlackID) {
    // If the email account isn't linked to a slackID yet, link it.
    if (!accountWithEmail.slackID) {
      return await prisma.accounts.update({
        where: { email },
        data: { slackID }
      });
    }
    return accountWithEmail;
  }

  // Both exist (different rows). Merge into the slack-based account, since it anchors slack relationships.
  if (accountWithEmail && accountWithSlackID) {
    // If the slack account already has a *different* email, do not merge.
    if (accountWithSlackID.email && accountWithSlackID.email !== email) {
      console.warn("Not consolidating accounts: slackID is linked to a different email", {
        slackID,
        identityEmail: email,
        slackAccountEmail: accountWithSlackID.email
      });
      return accountWithEmail;
    }

    try {
      return await prisma.$transaction(async tx => {
        // Preserve useful profile fields from the email-only account (only when missing on slack account).
        const mergedProfileData = {};
        const mergeField = (field, { treatEmptyStringAsMissing = false } = {}) => {
          const from = accountWithEmail[field];
          const to = accountWithSlackID[field];

          const toMissing =
            to === null ||
            to === undefined ||
            (Array.isArray(to) && to.length === 0) ||
            (treatEmptyStringAsMissing && to === "");

          const fromPresent =
            from !== null &&
            from !== undefined &&
            (!Array.isArray(from) || from.length > 0) &&
            (!treatEmptyStringAsMissing || from !== "");

          if (toMissing && fromPresent) mergedProfileData[field] = from;
        };

        // Strings (treat empty string as missing)
        mergeField("customDomain", { treatEmptyStringAsMissing: true });
        mergeField("cssURL", { treatEmptyStringAsMissing: true });
        mergeField("website", { treatEmptyStringAsMissing: true });
        mergeField("github", { treatEmptyStringAsMissing: true });
        mergeField("image", { treatEmptyStringAsMissing: true });
        mergeField("avatar", { treatEmptyStringAsMissing: true });
        mergeField("pronouns", { treatEmptyStringAsMissing: true });
        mergeField("timezone", { treatEmptyStringAsMissing: true });
        mergeField("customAudioURL", { treatEmptyStringAsMissing: true });
        mergeField("webhookURL", { treatEmptyStringAsMissing: true });

        // Non-strings
        mergeField("timezoneOffset");
        mergeField("fullSlackMember");
        mergeField("displayStreak");
        mergeField("streaksToggledOff");
        mergeField("streakCount");
        mergeField("maxStreaks");
        mergeField("newMember");
        mergeField("lastUsernameUpdatedTime");
        mergeField("webring");

        if (Object.keys(mergedProfileData).length) {
          await tx.accounts.update({
            where: { slackID },
            data: mergedProfileData
          });
        }

        // Move web-created posts (keyed by accountsID) from the email account to the slack account.
        await tx.updates.updateMany({
          where: { accountsID: accountWithEmail.id },
          data: {
            accountsID: accountWithSlackID.id,
            accountsSlackID: slackID
          }
        });

        // Move DB sessions (if any) from the email account to the slack account.
        await tx.session.updateMany({
          where: { userId: accountWithEmail.id },
          data: { userId: accountWithSlackID.id }
        });

        // Merge club memberships safely (avoid duplicates; preserve admin when either is admin).
        const [emailMemberships, slackMemberships] = await Promise.all([
          tx.clubMember.findMany({ where: { accountId: accountWithEmail.id } }),
          tx.clubMember.findMany({ where: { accountId: accountWithSlackID.id } })
        ]);

        const slackByClubId = new Map(slackMemberships.map(m => [m.clubId, m]));

        for (const m of emailMemberships) {
          const existing = slackByClubId.get(m.clubId);
          if (existing) {
            if (m.admin && !existing.admin) {
              await tx.clubMember.update({
                where: { id: existing.id },
                data: { admin: true }
              });
            }
            await tx.clubMember.delete({ where: { id: m.id } });
          } else {
            await tx.clubMember.update({
              where: { id: m.id },
              data: { accountId: accountWithSlackID.id }
            });
          }
        }

        // Delete the now-merged email-only account (frees the unique email).
        await tx.accounts.delete({ where: { id: accountWithEmail.id } });

        // Finally, attach the email to the slack account.
        return await tx.accounts.update({
          where: { slackID },
          data: {
            email,
            emailVerified: new Date()
          }
        });
      });
    } catch (err) {
      console.error("Failed to consolidate scrapbook accounts", err);
      // Be conservative: if anything exists, return it so we don't accidentally create a duplicate.
      return accountWithSlackID || accountWithEmail;
    }
  }

  return null;
}
export default NextAuth(authOptions)
