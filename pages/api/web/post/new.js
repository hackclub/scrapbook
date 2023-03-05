import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../auth/[...nextauth]'
import prisma from '../../../../lib/prisma'

const Mux = require('@mux/mux-node')

const { Video, Data } = new Mux(
  process.env.MUX_TOKEN_ID,
  process.env.MUX_TOKEN_SECRET
)

export default async (req, res) => {
  const session = await getServerSession(req, res, authOptions)
  if (session?.user === undefined) {
    res.redirect(`/?errorTryAgain`)
  }
  let muxAssetIDs = []
  let muxPlaybackIDs = []
  await Promise.all(
    JSON.parse(req.query.attachments).map(async attachment => {
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
  let clubKeys = Object.keys(req.query)
    .filter(x => x.includes('club-'))
    .map(key => key.replace('club-', ''))
  let update = await prisma.updates.create({
    data: {
      accountsID: session.user.id,
      text: req.query.text,
      attachments: JSON.parse(req.query.attachments),
      muxAssetIDs,
      muxPlaybackIDs,
      ...(clubKeys.length != 0
        ? {
            ClubUpdate: {
              create: clubKeys.map(clubKey => ({
                clubId: clubKey
              }))
            }
          }
        : {})
    },
    include: {
      Accounts: true
    }
  })
  res.redirect(`/?successfullyPosted`)
}
