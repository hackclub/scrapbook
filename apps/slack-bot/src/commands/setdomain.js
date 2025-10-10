import prisma from "../lib/prisma.js";
import { t } from "../lib/transcript.js";
import { getUserRecord } from "../lib/users.js";
import fetch from "node-fetch";

const TEAM_ID = "team_gUyibHqOWrQfv3PDfEUpB45J";

export default async ({ command, respond }) => {
  const arg = command.text.split(" ")[0];
  if (!arg) {
    await respond(t("messages.domain.noargs"));
  } else {
    const user = await getUserRecord(command.user_id);
    if (user.customDomain != null) {
      await fetch(
        `https://api.vercel.com/v1/projects/QmWRnAGRMjviMn7f2EkW5QEieMv2TAGjUz8RS698KZm5q8/alias?domain=${user.customDomain}&teamId=${TEAM_ID}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${process.env.VC_SCRAPBOOK_TOKEN}`,
          },
        }
      ).then((res) => res.json());
    }
    const vercelFetch = await fetch(
      `https://api.vercel.com/v9/projects/QmWRnAGRMjviMn7f2EkW5QEieMv2TAGjUz8RS698KZm5q8/domains?teamId=${TEAM_ID}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.VC_SCRAPBOOK_TOKEN}`,
        },
        body: JSON.stringify({
          name: arg,
        }),
      }
    )
      .then((r) => r.json())
      .catch((err) => {
      // console.log(`Error while setting custom domain ${arg}: ${err}`);
    });
    if (vercelFetch.error) {
      await respond(
        t("messages.domain.domainerror", {
          text: arg,
          error: JSON.stringify(vercelFetch.error),
        })
      );
    } else if (!vercelFetch.verified) {
      /*
      // domain is owned by another Vercel account, but we can ask the owner to verify
      console.log(vercelFetch.verification);
      */

      if (!vercelFetch.verification) {
        await respond(
          t("messages.domain.domainerror", {
            text: arg,
            error: "No verification records were provided by the Vercel API",
          })
        );
      }
      const record = vercelFetch.verification[0];
      const recordText = `type: \`${record.type}\`
domain: \`${record.domain}\`
value: \`${record.value}\``;
      await respond(
        t("messages.domain.domainverify", {
          text: recordText,
          domain: arg,
        })
      );
    } else {
      await prisma.accounts.update({
        where: { slackID: user.slackID },
        data: { customDomain: arg },
      });
      await respond(t("messages.domain.domainset", { text: arg }));
    }
  }
};
