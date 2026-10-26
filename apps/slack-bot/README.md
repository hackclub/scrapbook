# Scrappy

Scrappy is the Slack bot that powers [scrapbook.hackclub.com](https://scrapbook.hackclub.com). Scrappy generates your Scrapbook and Scrapbook posts via Slack messages. For more information about how to sign up for Scrapbook, check out the [about page](https://scrapbook.hackclub.com/about).

[Click here to view the Scrapbook repository](https://github.com/hackclub/scrapbook), which hosts the Scrapbook web code.

## Commands

Scrappy provides some helpful commands in Slack. These commands are also documented in our Slack if you send the message `/scrappy` in any channel.

- `/scrappy-togglestreaks`: toggles your streak count on/off in your status
- `/scrappy-togglestreaks all`: opts out of streaks completely
- `/scrappy-open`: opens your scrapbook (or another user's if you specify a username)
- `/scrappy-setcss`: adds a custom CSS file to your scrapbook profile. Check out this cool example!
- `/scrappy-setdomain`: links a custom domain to your scrapbook profile, e.g. [https://zachlatta.com](https://zachlatta.com)
- `/scrappy-setusername`: change your profile username
- `/scrappy-setaudio`: links an audio file to your Scrapbook. [See an example here](https://scrapbook.hackclub.com/matthew)!
- `/scrappy-webring`: adds or removes someone to your webring
- _Remove_ a post: delete the Slack message and Scrappy will automatically update for you
- _Edit_ a post: edit the Slack message and it will automatically update for you
- _Post_ a message to the `#scrapbook` channel or add an existing Slack message to Scrapbook by reacting to it with the `:scrappy:` emoji (Note: If it isn't working, make sure Scrappy is added to the channel by mentioning `@scrappy`)

## Scrapbook post moderation

Scrappy ports Nemo AutoMod's configurable `word`, `substring`, and `regex` matching modes for Scrapbook post text. A match creates a candidate for a human moderator; matching never deletes or warns on its own. Regex rules run in a worker with Nemo's 50 ms search limit so a slow pattern cannot block Scrappy's event loop. Nemo uses Python's `regex` syntax while Scrappy uses JavaScript regular expressions, so review production regex-mode rules for compatibility; invalid JavaScript patterns are skipped with a startup warning.

The scan runs once when Scrappy starts and every 30 minutes after that. It reads recent posts from the shared Scrapbook database and keeps a 30-minute overlap between scans to catch late arrivals. On first startup it checks roughly the previous hour. Slack post edits are rechecked immediately.

Signed-in users can report a real post with the **Report** button on feed, profile, and club posts. Each account can report a post once, with a limit of ten different posts per hour. A new report creates a pending moderation review or joins that post's existing pending review; it never approves or removes the post automatically. A report can reopen a previously accepted review, while an active review cannot be reported again until it is handled. Scrappy checks for new reports every 15 seconds and sends the same accept/reject card to the configured review channel, updating an existing card when another person reports it. Rejected posts are removed and can no longer be reported.

Rules are provided as JSON in `SCRAPBOOK_AUTOMOD_RULES`, using Nemo's field names and existing rule categories. Only rules whose effect is `flag` are used. For a local plumbing check, use the harmless word `modtest`:

```sh
SCRAPBOOK_AUTOMOD_RULES='[{"word":"modtest","match_mode":"word","effect":"flag"}]'
```

The repository does not include Nemo's live rule data. Configure only the existing, moderator-approved Nemo `flag` rules for production; the `modtest` example only checks that the alert and review flow works. The bot does not infer CoC violations from context. `SCRAPBOOK_BAD_WORDS` remains supported as a comma-separated list of base64-encoded words in whole-word mode for local plumbing checks.

Set `SCRAPBOOK_MODERATION_CHANNEL_ID` to a private review channel and `SCRAPBOOK_MODERATOR_USER_IDS` to the comma-separated IDs allowed to review. Add Scrappy to the channel, enable Slack Interactivity, and point its request URL at the existing `/slack/events` endpoint. The app needs `chat:write`, `im:write`, and `views:write`; `SLACK_USER_TOKEN` needs permission to delete a source Slack message when one exists. Rejecting a post requires the author to have a linked Slack ID so Scrappy can send the reason by DM. A rejected post is removed from Scrapbook; if Slack refuses deletion of the original channel message, the review card tells moderators to remove that source message manually.

For a shared or production database, apply the Scrapbook migrations and regenerate both Prisma clients:

```sh
# Keep PG_DATABASE_URL in apps/web/.env and apps/slack-bot/.env the same.
bun --cwd apps/web --bun prisma migrate deploy
bun run generate
```

For a brand-new, disposable local database, sync the current schema directly instead:

```sh
bun --cwd apps/web --bun prisma db push
bun run generate
```

`db push` does not create or validate migration history. Use it only for a disposable development database; use `migrate deploy` for a shared or production database. Keep the same local `PG_DATABASE_URL` in `apps/web/.env` and `apps/slack-bot/.env` so the website and bot share the test data.

The Hack Club Identity client ID and secret in `apps/web/.env` only let you sign into the local website. They are not Slack bot credentials. A real Slack review requires a separate development Slack app installed in a test workspace, with its bot token and signing secret in `apps/slack-bot/.env`; configure Interactivity to point to the bot's `/slack/events` endpoint. Website image uploads also need test S3 credentials in `apps/web/.env`. These credentials are not included in the repository; do not copy production secrets into a local setup.

Put the moderation channel, moderator IDs, and `SCRAPBOOK_AUTOMOD_RULES` in `apps/slack-bot/.env`. Use a separate test workspace and database, publish a post containing `modtest` with an image, and wait for the startup scan (or at most 30 minutes after startup). The test word is harmless and must never be used as a production rule. The repository does not include Nemo's live rule data, so a maintainer must supply the approved `flag` rules before the port can detect the same candidates as the live Nemo installation.

To verify the moderator flow manually, accept one flagged test post and confirm it remains visible. Publish another `modtest` post, choose **Reject**, enter a reason, and confirm the author receives that reason in Slack and the post disappears from the local Scrapbook. These steps verify the configured matching and review workflow; they do not validate Nemo's production rules or determine whether other content violates the Code of Conduct.

## Contributing

Contributions are encouraged and welcome! There are two GitHub repositories that contain code for Scrapbook: the [Scrapbook website](https://github.com/hackclub/scrapbook#contributing) and [Scrappy (the Slack bot)](https://github.com/hackclub/scrappy#contributing). Each repository has a section on contributing guidelines and how to run each project locally.

Development chatter happens in the [#scrapbook-dev](https://app.slack.com/client/T09V59WQY1E/C035D6S6TFW) channel in the [Hack Club Slack](https://hackclub.com/slack/).

## Running locally

In order to run Scrappy locally, you'll need to [join the Hack Club Slack](https://hackclub.com/slack). From there, ask @sampoder to be added to the `scrappy (dev)` app on Slack.

1. Clone this repository
   - `git clone https://github.com/hackclub/scrapbook.git && cd scrapbook`
1. Install [ngrok](https://dashboard.ngrok.com/get-started/setup) (if you haven't already)
   - Recommended installation is via [Homebrew](https://brew.sh/)
   - `brew install ngrok`
1. Install dependencies
   - `bun install --frozen-lockfile` (from the repository root)
1. Create the bot environment file
   - `touch apps/slack-bot/.env`
   - Send a message mentioning `@creds` in [Hack Club's Slack](https://hackclub.com/slack/) asking for the `.env` file contents
1. Link your `.env` with your Prisma schema
   - `bun run generate`
1. Start server
   - `bun run dev:slack-bot`
1. Forward your local server to ngrok
   - `ngrok http 3001`
   - Your ngrok URL will be printed out after running this command, which you will need for the next step
1. Update the [Slack settings](https://api.slack.com/apps/A015DCRTT43/event-subscriptions?)
   - Click the toggle to enable events
   - Update the URL request URL to be `<your-ngrok-url>/slack/events`. An example would look like `https://ea61-73-68-194-110.ngrok.io/slack/events`
   - Save changes and reinstall the Slack app
   - This will regenerate Scrappy's [oauth](https://api.slack.com/apps/A015DCRTT43/oauth?) tokens, so make sure to update these in the `.env` file 
