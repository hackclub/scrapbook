import { afterAll, expect, mock, spyOn, test } from 'bun:test'
import * as bolt from '@slack/bolt'

// Keep the real Bolt HTTP receiver, but never authenticate or post to Slack.
class OfflineApp extends bolt.App {
  constructor(options) {
    super({ ...options, tokenVerificationEnabled: false })
    this.client.chat.postMessage = async () => ({ ok: true })
  }
}
mock.module('@slack/bolt', () => ({ ...bolt, App: OfflineApp }))
mock.module('node-fetch', () => ({
  default: async url => {
    if (url !== 'https://api.github.com/repos/hackclub/scrappy/commits/main') {
      throw new Error(`Unexpected network request: ${url}`)
    }
    return new Response(
      JSON.stringify({ commit: { message: 'Offline smoke test' } })
    )
  }
}))

const originalCwd = process.cwd()
process.chdir(new URL('../apps/slack-bot', import.meta.url).pathname)
Object.assign(process.env, {
  PORT: '13101',
  SLACK_SIGNING_SECRET: 'offline-test-secret',
  SLACK_BOT_TOKEN: 'xoxb-offline-test',
  MUX_TOKEN_ID: 'offline-test',
  MUX_TOKEN_SECRET: 'offline-test',
  PLUGINS_AIRTABLE_API_KEY: 'offline-test',
  PLUGINS_AIRTABLE_BASE_ID: 'appOfflineTest',
  GRAPHITE_HOST: '127.0.0.1'
})
const { app } = await import('../apps/slack-bot/src/app.js')
const { t } = await import('../apps/slack-bot/src/lib/transcript.js')
const { isSlackFileUrl } = await import('../apps/slack-bot/src/lib/files.js')

// app.js starts its receiver asynchronously during module initialization.
for (let attempt = 0; attempt < 50; attempt++) {
  try {
    await fetch('http://127.0.0.1:13101')
    break
  } catch {
    await Bun.sleep(20)
  }
}

afterAll(async () => {
  await app.stop()
  process.chdir(originalCwd)
})

test('Bun loads the complete bot and serves its HTTP endpoint', async () => {
  const response = await fetch('http://127.0.0.1:13101')
  expect(response.status).toBe(200)
  expect(await response.text()).toBe('Hello World from Scrappy')
})

test('Bolt rejects unsigned Slack requests', async () => {
  const response = await fetch('http://127.0.0.1:13101/slack/events', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ type: 'url_verification', challenge: 'offline' })
  })
  expect(response.status).toBe(401)
})

test('Bolt 5.1 enforces its new 4 MB request limit', async () => {
  const response = await fetch('http://127.0.0.1:13101/slack/events', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ padding: 'x'.repeat(4 * 1024 * 1024) })
  })
  expect(response.status).toBe(413)
})

test('updated YAML parser loads the real transcript', () => {
  expect(
    t('startup.message', { latestCommitMsg: 'Offline smoke test' })
  ).toContain('Offline smoke test')
})

test('file URL validation still restricts credentials to Slack', () => {
  expect(isSlackFileUrl('https://files.slack.com/files-pri/example')).toBe(true)
  expect(isSlackFileUrl('https://slack.com.attacker.invalid/file')).toBe(false)
})

test('streak updates reject when user lookup fails', async () => {
  const users = await import('../apps/slack-bot/src/lib/users.js')
  const { incrementStreakCount } =
    await import('../apps/slack-bot/src/lib/streaks.js')
  const lookup = spyOn(users, 'getUserRecord').mockRejectedValueOnce(
    new Error('Offline lookup failure')
  )
  try {
    await expect(
      incrementStreakCount('offline-user', 'offline-channel', '', '0')
    ).rejects.toThrow('Offline lookup failure')
  } finally {
    lookup.mockRestore()
  }
})
