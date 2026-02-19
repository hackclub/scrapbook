import bolt from "@slack/bolt";
const { App, subtype, ExpressReceiver } = bolt;
import bodyParser from "body-parser";
import fetch from "node-fetch";
import { t } from "./lib/transcript.js";
import { mux } from "./routes/mux.js";
import streakResetter from "./routes/streakResetter.js";
import help from "./commands/help.js";
import setAudio from "./commands/setaudio.js";
import setCSS from "./commands/setcss.js";
import setDomain from "./commands/setdomain.js";
import setUsername from "./commands/setusername.js";
import toggleStreaks from "./commands/togglestreaks.js";
import webring from "./commands/webring.js";
import joined from "./events/joined.js";
import userChanged from "./events/userChanged.js";
import create from "./events/create.js";
import deleted from "./events/deleted.js";
import mention from "./events/mention.js";
import updated from "./events/updated.js";
import forget from "./events/forget.js";
import noFile, { noFileCheck } from "./events/noFile.js";
import reactionAdded from "./events/reactionAdded.js";
import reactionRemoved from "./events/reactionRemoved.js";
import { commands } from "./commands/commands.js";
import metrics from "./metrics.js";

const receiver = new ExpressReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});
receiver.router.use(bodyParser.urlencoded({ extended: true }));
receiver.router.use(bodyParser.json());

export const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  receiver,
});

export const execute = (actionToExecute) => {
  return async (slackObject, ...props) => {
    if (slackObject.ack) {
      await slackObject.ack();
    }

    let isCommandOrMessage = slackObject.payload.command || slackObject.payload.message;
    const payload = slackObject.payload;
    let metricKey;
    if (payload.type === "message" && payload.subtype) {
      metricKey = payload.subtype;
    } else {
      metricKey = payload.type;
    }

    try {
      // const metricMsg = `success.${metricKey}`;
      // const startTime = new Date().getTime();
      actionToExecute(slackObject, ...props)
        .then(() => {
        // const time = (new Date().getTime()) - startTime;
        // if (isCommandOrMessage) metrics.timing(metricKey, time);
      });
      if (isCommandOrMessage) metrics.increment(metricMsg, 1);
    } catch (e) {
      const metricMsg = `errors.${metricKey}`;
      if (isCommandOrMessage) metrics.increment(metricMsg, 1);
      console.log(e);
      await app.client.chat.postMessage({
        channel: "C04ULNY90BC",
        text: t("error", { e }),
        parse: "mrkdwn",
        unfurl_links: false,
        unfurl_media: false,
      });
    }
  };
};

app.command(`/${commands.scrappy}`, execute(help));

app.command(`/${commands.scrappyHelp}`, execute(help));

app.command(`/${commands.scrappySetAudio}`, execute(setAudio));

app.command(`/${commands.scrappySetCSS}`, execute(setCSS));

app.command(`/${commands.scrappySetDomain}`, execute(setDomain));

app.command(`/${commands.scrappyDisplayStreaks}`, execute(toggleStreaks));

app.command(`/${commands.scrappySetUsername}`, execute(setUsername));

app.command(`/${commands.scrappyToggleStreaks}`, execute(toggleStreaks));

app.command(`/${commands.scrappyWebring}`, execute(webring));

app.event("reaction_added", execute(reactionAdded));

app.event("reaction_removed", execute(reactionRemoved));

app.event("member_joined_channel", execute(joined));

app.event("user_change", execute(userChanged));

app.event("message", execute(create));

const messageChanged = (slackObject, ...props) => {
  if (slackObject.event.message.subtype == "tombstone") {
    execute(deleted)(slackObject, ...props);
  } else {
    return execute(updated)(slackObject, ...props);
  }
};

app.message(subtype("message_changed"), messageChanged);

app.message("forget scrapbook", execute(forget));

app.message("<@U015D6A36AG>", execute(mention));

try {
  receiver.router.post("/api/mux", mux.handler);
} catch (e) {
  // console.log(e);
}

try {
  receiver.router.get("/", (req, res) => {
    res.send("Hello World from Scrappy");
  });
} catch {
  // console.log("Something went wrong")
}

try {
  receiver.router.get("/api/streakResetter", streakResetter);
} catch (e) {
  // console.log(e);
}

(async () => {
  await app.start(process.env.PORT || 3001);
  let latestCommitMsg = "misc...";
  await fetch("https://api.github.com/repos/hackclub/scrappy/commits/main")
    .then((r) => r.json())
    .then((d) => (latestCommitMsg = d.commit?.message || ""));
  app.client.chat.postMessage({
    channel: "C0P5NE354",
    text: t("startup.message", { latestCommitMsg }),
    parse: "mrkdwn",
    unfurl_links: false,
    unfurl_media: false,
  });
  // console.log("⚡️ Scrappy is running !");
})();
