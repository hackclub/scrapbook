import type {
  QueryResolvers,
  MutationResolvers,
  AccountRelationResolvers,
} from 'types/graphql'

import { fetch } from 'cross-undici-fetch'
import md5 from "md5"
import { db } from 'src/lib/db'
import { ValidationError } from '@redwoodjs/graphql-server'

export const emailToPfp = email => {
  if (email == "") return "";
  return "https://www.gravatar.com/avatar/" + md5(email.toLowerCase().trim()) + '?d=identicon&r=pg';
}

export const accounts: QueryResolvers['accounts'] = () => {
  return db.account.findMany()
}

export const account: QueryResolvers['account'] = ({ id }) => {
  return db.account.findUnique({
    where: { id },
  })
}

export const accountByUsername: QueryResolvers['accountByUsername'] = ({
  username,
}) => {
  return db.account.findUnique({
    where: { username },
  })
}

export const createAccount: MutationResolvers['createAccount'] = ({
  input,
}) => {
  return db.account.create({
    data: {
      ...input,
      avatar: emailToPfp(input.email)
    },
  })
}

export const updateAccount: MutationResolvers['updateAccount'] = async ({
  id,
  input,
}) => {
  const TEAM_ID = 'team_gUyibHqOWrQfv3PDfEUpB45J'
  let current = await db.account.findFirst({
    where: { id },
  })
  if (current.customDomain != input.customDomain) {
    if (input.customDomain == '' || current.customDomain != null) {
      await fetch(
        `https://api.vercel.com/v1/projects/QmbACrEv2xvaVA3J5GWKzfQ5tYSiHTVX2DqTYfcAxRzvHj/alias?domain=${current.customDomain}&teamId=${TEAM_ID}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${process.env.VC_SCRAPBOOK_TOKEN}`,
          },
        }
      ).then((res) => res.json())
    }
    if (input.customDomain != '') {
      console.log(process.env.VC_SCRAPBOOK_TOKEN)
      const vercelFetch = await fetch(
        `https://api.vercel.com/v9/projects/QmbACrEv2xvaVA3J5GWKzfQ5tYSiHTVX2DqTYfcAxRzvHj/domains?teamId=${TEAM_ID}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.VC_SCRAPBOOK_TOKEN}`,
          },
          body: JSON.stringify({
            name: input.customDomain,
          }),
        }
      )
        .then((r) => r.json())
        .catch((err) => {
          console.log(
            `Error while setting custom domain ${input.customDomain}: ${err}`
          )
        })
      if (
        vercelFetch.error &&
        !vercelFetch.error.message.includes(
          "since it's already in use by your account."
        )
      ) {
        input.customDomain = null
        throw new ValidationError(vercelFetch.error.message)
      } else if (!vercelFetch.verified) {
        input.customDomain = null
        await fetch(
          `https://api.vercel.com/v1/projects/QmbACrEv2xvaVA3J5GWKzfQ5tYSiHTVX2DqTYfcAxRzvHj/alias?domain=${input.customDomain}&teamId=${TEAM_ID}`,
          {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${process.env.VC_SCRAPBOOK_TOKEN}`,
            },
          }
        ).then((res) => res.json())
        throw new ValidationError('Vercel DNS support coming soon.')
      }
    }
  }
  return db.account.update({
    data: input,
    where: { id },
  })
}

export const deleteAccount: MutationResolvers['deleteAccount'] = ({ id }) => {
  return db.account.delete({
    where: { id },
  })
}

export const Account: AccountRelationResolvers = {
  credentials: (_obj, { root }) => {
    return db.account.findUnique({ where: { id: root?.id } }).credentials()
  },
  updates: (_obj, { root }) => {
    return db.account.findUnique({ where: { id: root?.id } }).updates()
  },
}
