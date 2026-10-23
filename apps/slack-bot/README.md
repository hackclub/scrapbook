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

## Contributing

Contributions are encouraged and welcome! There are two GitHub repositories that contain code for Scrapbook: the [Scrapbook website](https://github.com/hackclub/scrapbook#contributing) and [Scrappy (the Slack bot)](https://github.com/hackclub/scrappy#contributing). Each repository has a section on contributing guidelines and how to run each project locally.

Development chatter happens in the [#scrapbook-dev](https://app.slack.com/client/T09V59WQY1E/C035D6S6TFW) channel in the [Hack Club Slack](https://hackclub.com/slack/).

## Running locally

For local testing, use a dedicated Slack workspace and Slack app that you can configure. Add the bot to a test channel; do not use production credentials.

1. Clone this repository
   - `git clone https://github.com/hackclub/scrapbook.git && cd scrapbook`
1. Install [ngrok](https://dashboard.ngrok.com/get-started/setup) (if you haven't already)
   - Recommended installation is via [Homebrew](https://brew.sh/)
   - `brew install ngrok`
1. Install dependencies
   - `bun install --frozen-lockfile` (from the repository root)
1. Create the bot environment file
   - `touch apps/slack-bot/.env`
   - Fill in the values for your test workspace and app:
     - `PG_DATABASE_URL` (local PostgreSQL connection string)
     - `SLACK_BOT_TOKEN`
     - `SLACK_USER_TOKEN`
     - `SLACK_ADMIN_TOKEN`
     - `SLACK_SIGNING_SECRET`
     - `CHANNEL` (the ID of the test channel)
     - `S3_ACCESS_KEY_ID` and `S3_SECRET_ACCESS_KEY` (credentials for the configured Scrapbook media bucket)
     - `MUX_TOKEN_ID` and `MUX_TOKEN_SECRET` (for video processing)
1. Link your `.env` with your Prisma schema
   - `bun run generate`
1. Start server
   - `bun run dev:slack-bot`
1. Forward your local server to ngrok
   - `ngrok http 3001`
   - Your ngrok URL will be printed out after running this command, which you will need for the next step
1. Configure Event Subscriptions for your test Slack app
   - Enable events and set the Request URL to `<your-ngrok-url>/slack/events` (for example, `https://example.ngrok.io/slack/events`).
   - Save the changes and install the app in your test workspace.
   - Put the app's tokens and signing secret in `apps/slack-bot/.env`.
