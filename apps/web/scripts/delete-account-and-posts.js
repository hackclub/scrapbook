/**
 * Delete all posts (Updates) by an account, then delete the account.
 *
 * Defaults to dry-run. Pass --apply AND --confirm <username> to perform deletion.
 *
 * Usage:
 *   node apps/web/scripts/delete-account-and-posts.js --username <username> [--apply --confirm <username>]
 *   node apps/web/scripts/delete-account-and-posts.js --email <email>       [--apply --confirm <username>]
 *
 * Notes:
 * - Requires PG_DATABASE_URL in env (or in a .env loaded by dotenv).
 * - "Posts by account" includes Updates where:
 *     - accountsID === Accounts.id
 *     - accountsSlackID === Accounts.slackID (if slackID exists)
 * - Also deletes dependent rows tied to those Updates (EmojiReactions, ClubUpdate) to avoid FK issues.
 */
/* eslint-disable no-console */
const path = require('path')
const { PrismaClient } = require('@prisma/client')
const dotenv = require('dotenv')

function parseArgs(argv) {
  const out = {
    username: null,
    email: null,
    apply: false,
    confirm: null,
    help: false
  }

  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--username' || a === '--user') {
      out.username = argv[++i]
    } else if (a === '--email') {
      out.email = argv[++i]
    } else if (a === '--apply') {
      out.apply = true
    } else if (a === '--dry-run' || a === '--dryrun') {
      out.apply = false
    } else if (a === '--confirm') {
      out.confirm = argv[++i]
    } else if (a === '--help' || a === '-h') {
      out.help = true
    }
  }

  return out
}

function printHelp() {
  console.log(`
Delete Scrapbook account + all posts (Updates) by that account

Required:
  --username <username>  OR  --email <email>

Optional:
  --apply                Actually delete (default: dry-run)
  --confirm <username>   Required with --apply; must match the account's username
  --dry-run              Force dry-run

Examples (dry-run):
  node apps/web/scripts/delete-account-and-posts.js --username josia
  node apps/web/scripts/delete-account-and-posts.js --email josia@example.com

Examples (apply):
  node apps/web/scripts/delete-account-and-posts.js --username josia --apply --confirm josia
  node apps/web/scripts/delete-account-and-posts.js --email josia@example.com --apply --confirm josia
`.trim())
}

function buildPostsOrClauses(account) {
  const clauses = [{ accountsID: account.id }]
  if (account.slackID) clauses.push({ accountsSlackID: account.slackID })
  return clauses
}

async function main() {
  // Load env from common locations (works whether you run from repo root or apps/web)
  dotenv.config()
  dotenv.config({ path: path.resolve(process.cwd(), 'apps/web/.env') })
  dotenv.config({ path: path.resolve(process.cwd(), 'apps/web/.env.local') })

  const args = parseArgs(process.argv.slice(2))
  if (args.help || (!args.username && !args.email)) {
    printHelp()
    process.exit(args.help ? 0 : 1)
  }

  if (!process.env.PG_DATABASE_URL) {
    console.error('Missing PG_DATABASE_URL in environment.')
    process.exit(1)
  }

  const prisma = new PrismaClient()
  try {
    const byUsername = args.username
      ? await prisma.accounts.findUnique({
          where: { username: args.username },
          select: { id: true, username: true, email: true, slackID: true }
        })
      : null

    const byEmail = args.email
      ? await prisma.accounts.findUnique({
          where: { email: args.email },
          select: { id: true, username: true, email: true, slackID: true }
        })
      : null

    let account = byUsername || byEmail
    if (byUsername && byEmail && byUsername.id !== byEmail.id) {
      console.error(
        `Provided --username and --email refer to different accounts:\n` +
          `  username -> ${byUsername.username} (${byUsername.id})\n` +
          `  email    -> ${byEmail.username} (${byEmail.id})`
      )
      process.exit(1)
    }

    if (!account) {
      console.error('No account found for the provided identifier.')
      process.exit(1)
    }

    const postOr = buildPostsOrClauses(account)
    const updatesWhere = { OR: postOr }
    const emojiWhere = { update: { OR: postOr } }
    const clubUpdateWhere = { update: { OR: postOr } }

    const [updatesCount, emojiCount, clubUpdateCount] = await Promise.all([
      prisma.updates.count({ where: updatesWhere }),
      prisma.emojiReactions.count({ where: emojiWhere }),
      prisma.clubUpdate.count({ where: clubUpdateWhere })
    ])

    console.log('Target account:', account)
    console.log('\nWill delete:')
    console.log(`- Updates (posts): ${updatesCount}`)
    console.log(`- EmojiReactions on those posts: ${emojiCount}`)
    console.log(`- ClubUpdate rows for those posts: ${clubUpdateCount}`)
    console.log(`- Accounts row: 1`)

    if (!args.apply) {
      console.log('\nDry-run: nothing deleted. Re-run with --apply --confirm <username> to delete.')
      return
    }

    if (!args.confirm || args.confirm !== account.username) {
      console.error(
        `Refusing to apply without explicit confirmation.\n` +
          `Re-run with: --apply --confirm ${account.username}`
      )
      process.exit(1)
    }

    const result = await prisma.$transaction(async tx => {
      const deletedEmoji = await tx.emojiReactions.deleteMany({ where: emojiWhere })
      const deletedClubUpdate = await tx.clubUpdate.deleteMany({ where: clubUpdateWhere })
      const deletedUpdates = await tx.updates.deleteMany({ where: updatesWhere })
      const deletedAccount = await tx.accounts.delete({ where: { id: account.id } })

      return { deletedEmoji, deletedClubUpdate, deletedUpdates, deletedAccount }
    })

    console.log('\nDeleted:')
    console.log(`- EmojiReactions: ${result.deletedEmoji.count}`)
    console.log(`- ClubUpdate: ${result.deletedClubUpdate.count}`)
    console.log(`- Updates: ${result.deletedUpdates.count}`)
    console.log(`- Account: ${result.deletedAccount.username} (${result.deletedAccount.id})`)
  } finally {
    await prisma.$disconnect()
  }
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})



