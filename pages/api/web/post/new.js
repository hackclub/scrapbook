import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../auth/[...nextauth]'
import prisma from '../../../../lib/prisma'
import metrics from "../../../../metrics";

const Mux = require('@mux/mux-node')

const { Video, Data } = new Mux(
  process.env.MUX_TOKEN_ID,
  process.env.MUX_TOKEN_SECRET
)

export default async (req, res) => {
  const session = await getServerSession(req, res, authOptions)

  if (session?.user === undefined) {
    res.json({ error: true })
  }

  try {
    let muxAssetIDs = []
    let muxPlaybackIDs = []
    await Promise.all(
      req.body.attachments.map(async attachment => {
        let filename = attachment.split('.')
        if (
          ['mp4', 'mov', 'webm'].includes(
            filename[filename.length - 1].toLowerCase()
          )
        ) {
          let asset = await Video.Assets.create({
            input: attachment,
            playback_policy: ['public']
          })
          let playbackID = await Video.Assets.createPlaybackId(asset.id, {
            policy: 'public'
          })
          muxAssetIDs.push(asset.id)
          muxPlaybackIDs.push(playbackID.id)
        }
      })
    )

    let clubKeys = Object.keys(req.body)
      .filter(x => x.includes('club-'))
      .map(key => key.replace('club-', ''))

    let update = await prisma.updates.create({
      data: {
        accountsID: session.user.id,
        text: req.body.text,
        attachments: req.body.attachments,
        muxAssetIDs,
        muxPlaybackIDs,
        ...(clubKeys.length != 0
          ? {
              ClubUpdate: {
                create: {
                  clubId: clubKeys[0]
                }
              }
            }
          : {})
      },
      include: {
        Accounts: true
      }
    })

    metrics.increment("success.create_new_post", 1);
    res.json({ update, callback: `/` })
  } catch (e) {
    metrics.increment("errors.create_new_post", 1);
    console.error(e)
    res.json({ error: true })
  }
}
