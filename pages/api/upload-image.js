import { v4 as uuidv4 } from "uuid";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

export default async function handleGetSignedUrl(req, res) {
  const { filename, filetype } = req.query;
  console.log(filename, filetype)

  const s3Client = new S3Client({
    region: "us-east-1",
    credentials: {
      accessKeyId: process.env.NEXT_PUBLIC_S3_ACCESS_KEY_ID,
      secretAccessKey: process.env.NEXT_PUBLIC_S3_SECRET_ACCESS_KEY
    }
  });

  const command = new PutObjectCommand({
    Bucket: 'scrapbook-into-the-redwoods',
    Key: `${uuidv4()}-${filename}`,
    ContentType: filetype
  });

  // generate a new signed url that expires in 1 hour
  const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 })

  if (signedUrl) return res.send({ signedUrl })

}
