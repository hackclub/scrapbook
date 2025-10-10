import { react } from "./slack.js";
import prisma from "./prisma.js";
import emojiKeywords from "./emojiKeywords.js";

export const getReactionRecord = async (emoji, updateId) =>
  await prisma.emojiReactions.findFirst({
    where: {
      emojiTypeName: emoji,
      updateId: updateId,
    },
  });

export const reactBasedOnKeywords = (channel, message, ts) => {
  Object.keys(emojiKeywords).forEach(async (keyword) => {
    try {
       if (
        message?.toLowerCase().search(new RegExp("\\b" + keyword + "\\b", "gi")) !== -1
      ) {
        await react("add", channel, ts, emojiKeywords[keyword]);
      }
    }
    catch (e) {
      // console.log(message)
      // console.log(e)
    }
  });
};
