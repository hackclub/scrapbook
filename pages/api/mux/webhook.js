const Mux = require('@mux/mux-node')
const { Video, Data } = new Mux()

import { updatesTable } from '../../../lib/api-utils'

export default async (req, res) => {
  await res.status(200).end()
  if (req.body.type === 'video.asset.ready') {
    console.log(req.body)

    const assetId = req.body.object.id
    const playback = await Video.Assets.createPlaybackId(assetId, { policy: 'public' }).then(async id => {
      const playbackId = JSON.stringify(id)
      console.log(`playback: ${playbackId}`)
      const assetRecord = (await updatesTable.read({
        maxRecords: 1,
        filterByFormula: `FIND('${assetId}', {Mux Asset IDs})`
      }))[0]
      const currentUrls = assetRecord.fields['Mux Playback URLs']
      console.log(currentUrls)
      await updatesTable.update(assetRecord.id, {
        'Mux Playback URLs': currentUrls != undefined ? `${currentUrls} https://stream.mux.com/${id.id}.m3u8` : `https://stream.mux.com/${id.id}.m3u8`
      })
    })
  }
}