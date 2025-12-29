/**
 * Reassigns Scrapbook "posts" (Updates) for a given Slack ID to a chosen account ID.
 *
 * Defaults to dry-run. Pass --apply to perform the update.
 *
 * Usage:
 *   node apps/web/scripts/reassign-posts-by-slack-id.js --slack-id U012ABCDEF --account-id ckxyz... [--apply] [--limit 20]
 *
 * Notes:
 * - Requires PG_DATABASE_URL in env (or in a .env loaded by dotenv).
 * - This updates Updates.accountsID where Updates.accountsSlackID matches the given Slack ID.
 */
/* eslint-disable no-console */
const path = require('path')
const { PrismaClient } = require('@prisma/client')
const dotenv = require('dotenv')

function parseArgs(argv) {
  const out = {
    slackId: null,
    accountId: null,
    apply: false,
    limit: 20
  }

  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--slack-id' || a === '--slackID' || a === '--slackId') {
      out.slackId = argv[++i]
    } else if (a === '--account-id' || a === '--accountID' || a === '--accountId') {
      out.accountId = argv[++i]
    } else if (a === '--apply') {
      out.apply = true
    } else if (a === '--dry-run' || a === '--dryrun') {
      out.apply = false
    } else if (a === '--limit') {
      out.limit = Number(argv[++i])
    } else if (a === '--help' || a === '-h') {
      out.help = true
    }
  }

  if (!Number.isFinite(out.limit) || out.limit < 0) out.limit = 20
  return out
}

function printHelp() {
  console.log(`
Reassign posts (Updates) by Slack ID

Required:
  --slack-id     Slack user ID (e.g. U012ABCDEF)
  --account-id   Target Accounts.id (cuid)

Optional:
  --apply        Actually perform the update (default: dry-run)
  --dry-run      Force dry-run
  --limit N      Preview up to N matching posts (default: 20)

Example (dry-run):
  node apps/web/scripts/reassign-posts-by-slack-id.js --slack-id U012ABCDEF --account-id ckxyz

Example (apply):
  node apps/web/scripts/reassign-posts-by-slack-id.js --slack-id U012ABCDEF --account-id ckxyz --apply
`.trim())
}

async function main() {
  // Load env from common locations (works whether you run from repo root or apps/web)
  dotenv.config()
  dotenv.config({ path: path.resolve(process.cwd(), 'apps/web/.env') })
  dotenv.config({ path: path.resolve(process.cwd(), 'apps/web/.env.local') })

  const args = parseArgs(process.argv.slice(2))
  if (args.help || !args.slackId || !args.accountId) {
    printHelp()
    process.exit(args.help ? 0 : 1)
  }

  if (!process.env.PG_DATABASE_URL) {
    console.error('Missing PG_DATABASE_URL in environment.')
    process.exit(1)
  }

  const prisma = new PrismaClient()
  try {
    const targetAccount = await prisma.accounts.findUnique({
      where: { id: args.accountId },
      select: { id: true, username: true, slackID: true, email: true }
    })

    if (!targetAccount) {
      console.error(`No Accounts row found with id=${args.accountId}`)
      process.exit(1)
    }

    const where = { accountsSlackID: args.slackId }

    const [total, byAccount, preview] = await Promise.all([
      prisma.updates.count({ where }),
      prisma.updates.groupBy({
        by: ['accountsID'],
        where,
        _count: { _all: true }
      }),
      prisma.updates.findMany({
        where,
        orderBy: { postTime: 'desc' },
        take: args.limit,
        select: {
          id: true,
          accountsID: true,
          accountsSlackID: true,
          postTime: true,
          channel: true,
          messageTimestamp: true,
          text: true
        }
      })
    ])

    console.log('Target account:', targetAccount)
    console.log(`Matching posts (Updates) for accountsSlackID=${args.slackId}: ${total}`)
    console.log('Current distribution by accountsID:')
    for (const row of byAccount.sort((a, b) => b._count._all - a._count._all)) {
      console.log(`  ${row.accountsID ?? 'null'}: ${row._count._all}`)
    }

    if (preview.length) {
      console.log(`\nPreview (latest ${preview.length}):`)
      for (const u of preview) {
        const shortText = (u.text || '').replace(/\s+/g, ' ').slice(0, 120)
        console.log(`- ${u.id} accountsID=${u.accountsID ?? 'null'} postTime=${u.postTime.toISOString()} text="${shortText}"`)
      }
    }

    if (!args.apply) {
      console.log('\nDry-run: no updates performed. Re-run with --apply to write changes.')
      return
    }

    const result = await prisma.updates.updateMany({
      where,
      data: { accountsID: args.accountId }
    })

    console.log(`\nUpdated rows: ${result.count}`)
  } finally {
    await prisma.$disconnect()
  }
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})



