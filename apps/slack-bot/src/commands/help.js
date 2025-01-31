import { t } from "../lib/transcript.js";

export default async ({ respond }) => {
  await respond(t("messages.help"));
};
