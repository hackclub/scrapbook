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

Development chatter happens in the [#scrapbook-dev](https://app.slack.com/client/T0266FRGM/C035D6S6TFW) channel in the [Hack Club Slack](https://hackclub.com/slack/).

## Running locally

In order to run Scrappy locally, you'll need to [join the Hack Club Slack](https://hackclub.com/slack). From there, ask @sampoder to be added to the `scrappy (dev)` app on Slack.

1. Clone this repository
   - `git clone https://github.com/hackclub/scrappy.git && cd scrappy`
1. Install [ngrok](https://dashboard.ngrok.com/get-started/setup) (if you haven't already)
   - Recommended installation is via [Homebrew](https://brew.sh/)
   - `brew install ngrok`
1. Install dependencies
   - `yarn`
1. Create `.env` file at root of project
   - `touch .env`
   - Send a message mentioning `@creds` in [Hack Club's Slack](https://hackclub.com/slack/) asking for the `.env` file contents
1. Link your `.env` with your Prisma schema
   - `npx prisma generate`
1. Start server
   - `yarn dev`
1. Forward your local server to ngrok
   - `ngrok http 3000`
   - Your ngrok URL will be printed out after running this command, which you will need for the next step
1. Update the [Slack settings](https://api.slack.com/apps/A015DCRTT43/event-subscriptions?)
   - Click the toggle to enable events
   - Update the URL request URL to be `<your-ngrok-url>/api/slack/message`. An example would look like `https://ea61-73-68-194-110.ngrok.io/api/slack/message`
   - Save changes and reinstall the Slack app
   - This will regenerate Scrappy's [oauth](https://api.slack.com/apps/A015DCRTT43/oauth?) tokens, so make sure to update these in the `.env` file 
