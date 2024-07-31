import { v4 as uuidv4 } from "uuid";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import s3 from "../../lib/s3";

export default async function handleGetSignedUrl(req, res) {
  const { filename, filetype } = req.query;

  const command = new PutObjectCommand({
    Bucket: 'scrapbook-into-the-redwoods',
    Key: `${uuidv4()}-${filename}`,
    ContentType: filetype
  });

  // generate a new signed url that expires in 1 hour
  const signedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 })

  if (signedUrl) return res.send({ signedUrl })

}
