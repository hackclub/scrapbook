import { randomUUID } from 'crypto'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { requireVerifiedWebUser } from '../../lib/auth-session'
import s3 from '../../lib/s3'

export default async function handleGetSignedUrl(req, res) {
  const session = await requireVerifiedWebUser(req, res)
  if (!session) return

  const { filename, filetype } = req.query
  if (
    typeof filename !== 'string' ||
    !filename ||
    filename.length > 200 ||
    typeof filetype !== 'string' ||
    !/^(image\/(png|jpeg|gif|webp|avif|heic)|video\/(mp4|quicktime|webm)|audio\/(mpeg|mp3|wav|x-wav|aiff|mp4|webm|ogg))$/.test(
      filetype
    )
  ) {
    return res
      .status(400)
      .json({ error: true, message: 'Invalid media upload' })
  }

  const command = new PutObjectCommand({
    Bucket: 'scrapbook-into-the-redwoods',
    Key: `web/${session.user.id}/${randomUUID()}-${filename.replace(/[^a-zA-Z0-9._-]/g, '_')}`,
    ContentType: filetype
  })

  // generate a new signed url that expires in 1 hour
  const signedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 })

  if (signedUrl) return res.send({ signedUrl })
}
