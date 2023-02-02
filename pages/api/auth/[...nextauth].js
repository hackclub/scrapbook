import NextAuth from "next-auth"
import Email from "next-auth/providers/email"
import prisma from '../../../lib/prisma'

function PrismaAdapter(p) {
    return {
        createUser: (data) => p.accounts.create({ data: {username: data.email, ...data} }),
        getUser: (id) => p.accounts.findUnique({ where: { id } }),
        getUserByEmail: (email) => p.accounts.findUnique({ where: { email } }),
        async getUserByAccount(provider_providerAccountId) {
            var _a;
            const account = await p.webAccounts.findUnique({
                where: { provider_providerAccountId },
                select: { user: true },
            });
            return (_a = account === null || account === void 0 ? void 0 : account.user) !== null && _a !== void 0 ? _a : null;
        },
        updateUser: ({ id, ...data }) => p.accounts.update({ where: { id }, data }),
        deleteUser: (id) => p.accounts.delete({ where: { id } }),
        linkAccount: (data) => p.webAccounts.create({ data: {...data, username: data.email} }),
        unlinkAccount: (provider_providerAccountId) => p.webAccounts.delete({
            where: { provider_providerAccountId },
        }),
        async getSessionAndUser(sessionToken) {
            const userAndSession = await p.session.findUnique({
                where: { sessionToken },
                include: { user: true },
            });
            if (!userAndSession)
                return null;
            const { user, ...session } = userAndSession;
            return { user, session };
        },
        createSession: (data) =>  p.session.create({ data }),
        updateSession: (data) => p.session.update({ where: { sessionToken: data.sessionToken }, data }),
        deleteSession: (sessionToken) => p.session.delete({ where: { sessionToken } }),
        async createVerificationToken(data) {
            const verificationToken = await p.verificationToken.create({ data });
            if (verificationToken.id)
                delete verificationToken.id;
            return verificationToken;
        },
        async useVerificationToken(identifier_token) {
            try {
                const verificationToken = await p.verificationToken.delete({
                    where: { identifier_token },
                });
                if (verificationToken.id)
                    delete verificationToken.id;
                return verificationToken;
            }
            catch (error) {
                if (error.code === "P2025")
                    return null;
                throw error;
            }
        },
    };
}
exports.PrismaAdapter = PrismaAdapter;


export default NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Email({
      server: {
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
    }),
  ],
})