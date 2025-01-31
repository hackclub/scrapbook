import { reply } from "../lib/slack.js";
import { t } from "../lib/transcript.js";

const wordList = [
  "fuck",
  "dumb",
  "suck",
  "stupid",
  "crap",
  "crappy",
  "trash",
  "trashy",
];

const messageContainsWord = (msg) =>
  wordList.some((word) => msg.includes(word));

export default async ({ message }) => {
  const { channel, ts, user, text, thread_ts } = message;
  const containsWord = await messageContainsWord(text);
  if (containsWord) {
    reply(channel, thread_ts || ts, t("messages.mentionKeyword", { user }));
  } else {
    reply(channel, thread_ts || ts, t("messages.mention", { user }));
  }
};
