import prisma from "../lib/prisma.js";
import * as emoji from "node-emoji";
import { app } from "../app.js";

export const emojiExists = async (emoji, updateId) =>
  prisma.emojiReactions
    .findMany({
      where: {
        updateId: updateId,
        emojiTypeName: emoji,
      },
    })
    .then((r) => r.length > 0)
    .catch((err) => console.log("Cannot check if emoji exists", err));

export const getEmojiRecord = async (reaction) => {
  reaction = reaction.split("::")[0]; // Removes skin tone modifiers. e.g :+1::skin-tone-5:.
  const emojiRecord = await prisma.emojiType.findMany({
    where: {
      name: reaction,
    },
  });
  if (emojiRecord.length > 0) return emojiRecord[0];
  else {
    let emojiSource;
    let unicodeEmoji = emoji.find(reaction);
    if (!unicodeEmoji) {
      const emojiList = await app.client.emoji.list();
      emojiSource = emojiList.emoji[reaction];
    } else {
      emojiSource = unicodeEmoji.emoji;
    }
    return await prisma.emojiType.create({
      data: {
        name: reaction,
        emojiSource: emojiSource,
      },
    });
  }
};
