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

          const { identity } = await userInfoResponse.json();
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

          return await prisma.accounts.upsert({
            where: {email},
            update: {
              slackID: identity?.slack_id || null,
            },
            create: {
              username: username || email,
              email,
              image: identity?.avatar || null,
              emailVerified: new Date(),
              slackID: identity?.slack_id || null,
            },
          });
        } catch (error) {
          console.error('Identity login error:', error);
          return null;
        }
      },
    }),
  ]
}

export default NextAuth(authOptions)