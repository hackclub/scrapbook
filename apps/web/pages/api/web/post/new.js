import Mux from '@mux/ts'
import { requireVerifiedWebUser } from '../../../../lib/auth-session'
import prisma from '../../../../lib/prisma'
import { ownedUploadKey } from '../../../../lib/uploads'

const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID,
  tokenSecret: process.env.MUX_TOKEN_SECRET
})

export default async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ error: true, message: 'Method Not Allowed' })
  }

  const session = await requireVerifiedWebUser(req, res)
  if (!session) return
  if (
    typeof req.body?.text !== 'string' ||
    req.body.text.length > 10000 ||
    !Array.isArray(req.body.attachments) ||
    req.body.attachments.length < 1 ||
    req.body.attachments.length > 10 ||
    req.body.attachments.some(
      url =>
        typeof url !== 'string' ||
        url.length > 2048 ||
        !ownedUploadKey(url, session.user.id)
    )
  ) {
    return res
      .status(400)
      .json({ error: true, message: 'Invalid post or attachments' })
  }

  try {
    let muxAssetIDs = []
    let muxPlaybackIDs = []

    let clubKeys = Object.keys(req.body)
      .filter(x => x.includes('club-'))
      .map(key => key.replace('club-', ''))

    if (clubKeys.length !== 0) {
      const clubId = clubKeys[0]
      const isMember = await prisma.clubMember.findFirst({
        where: {
          clubId,
          accountId: session.user.id
        },
        select: { id: true }
      })
      if (!isMember) {
        return res
          .status(403)
          .json({ error: true, message: 'Not a member of that club' })
      }
    }

    await Promise.all(
      req.body.attachments.map(async attachment => {
        let filename = attachment.split('.')
        if (
          ['mp4', 'mov', 'webm'].includes(
            filename[filename.length - 1].toLowerCase()
          )
        ) {
          let asset = await mux.video.assets.create({
            inputs: [{ url: attachment }],
            playback_policies: ['public']
          })
          muxAssetIDs.push(asset.id)
          muxPlaybackIDs.push(asset.playback_ids[0].id)
        }
      })
    )

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

    res.json({ update, callback: `/` })
  } catch {
    // console.error(e)
    res.status(500).json({ error: true })
  }
}
