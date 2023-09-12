import NextAuth from 'next-auth'
import Email from 'next-auth/providers/email'
import prisma from '../../../lib/prisma'
import { createTransport } from 'nodemailer'

async function sendVerificationRequest(params) {
  const { identifier, url, provider, theme } = params
  const { host } = new URL(url)
  const transport = createTransport(provider.server)
  const result = await transport.sendMail({
    to: identifier,
    from: `Hack Club <${provider.from}>`,
    subject: `Sign in to ${host}`,
    text: text({ url, host }),
    html: html({ url, host, theme })
  })

  const failed = result.rejected.concat(result.pending).filter(Boolean)

  if (failed.length) {
    throw new Error(`Email(s) (${failed.join(', ')}) could not be sent`)
  }
}

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
  secret: process.env.TOKEN_SECRET,
  adapter: PrismaAdapter(prisma),
  pages: {
    verifyRequest: '/?checkYourEmail',
    error: '/auth/error',
    newUser: '/new'
  },
  callbacks: {
    async session({ session, user, token }) {
      return {
        ...session,
        user: { ...session.user, username: user.username, id: user.id, ...user }
      }
    },
    async jwt({ token, user, account, profile, isNewUser }) {
      return token
    }
  },
  providers: [
    Email({
      server: {
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD
        }
      },
      from: process.env.EMAIL_FROM,
      sendVerificationRequest
    })
  ]
}

export default NextAuth(authOptions)

function html(params) {
  const { url } = params
  return `
  <html>
  <head>
  <style>
    .wrapper {
      padding: 1rem;
      margin: 0 auto;
      max-width: 600px;
      font-family: 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Fira Sans', 'Oxygen', 'Ubuntu', 'Helvetica Neue', sans-serif;
    }

    .container {
      padding: 0;
      margin: 0;
      width: 100%;
      max-width: 100%;
    }

    a {
      color: #8492a6;
    }

    .section {
      padding: 0.5rem 1rem;
    }

    .footer {
      font-size: 0.8rem;
      line-height: 1.2rem;
      color: #606a79;

      background-position: center;
      background-size: cover;
      background-repeat: repeat-x;
    }

    .footer p {
      margin-block-start: 0.5rem;
      margin-block-end: 0.5rem;
    }

    .footer a {
      color: #646464;
    }
  </style>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  </head>
  <body>
  <div class="wrapper">
    <div class="container">
      <table>
        <thead>
        <tr>
          <th>
            <div class="section" style="text-align: left;">
              <a
                href="https://hackclub.com"
                target="_blank"
              >
                <img
                  src="https://assets.hackclub.com/icon-rounded.png"
                  alt="Hack Club Logo"
                  style="width: 2.5rem"
                />
              </a>
            </div>
          </th>
        </tr>
        </thead>
        <tbody>
        <tr>
          <td>
            <div
              class="section"
            >
            <p>Hi 👋,</p>
            <p>You requested a login for <a href="https://hackclub.com" target="_blank">Hack Club</a>. It's here:</p>
            <a href="${url}">
              <pre style="text-align:center;background-color:#ebebeb;padding:8px;font-size:1.5em;border-radius:4px">${url}</pre>
            </a>
            <p>- Hack Club</p>
            </div>
          </td>
        </tr>
        <tr>
          <td>
            <div
              class="footer section"
              style="background-image: url('https://hackclub.com/pattern.svg');"
            >
              <p>
                Hack Club |
                <a href="mailto:team@hackclub.com">team@hackclub.com</a>
                |
                <a href="tel:+1855625HACK">1-855-625-HACK</a>
              </p>
              <p>
                Hack Club is an
                <a href="https://hackclub.com/opensource" target="_blank">open source</a>
                and
                <a href="https://hcb.hackclub.com/hq" target="_blank"
                  >financially transparent</a
                >
                501(c)(3) nonprofit. Our EIN is 81-2908499. By the students, for the
                students.
              </p>
            </div>
        </tr>
        </tbody>
      </table>
    </div>
  </div>
  
  </body>
  </html>
`
}

function text({ url }) {
  return `Hi 👋, \n\n

  You requested a login URL for Hack Club's Scrapbook. It's here: ${url}. \n\n
  
  - Hack Club`
}
