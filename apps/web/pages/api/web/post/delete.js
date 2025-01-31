import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import prisma from '../../../../lib/prisma';
import s3 from '../../../../lib/s3';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';

export default async (req, res) => {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user) {
    console.log('Unauthorized access attempt');
    return res.status(401).send({message: "Unauthorized"});
  }

  try {
    const update = await prisma.updates.delete({
      where: { id: req.body.id },
    });
    
    for (let attachment of update.attachments) {
      console.log("attachment", attachment);
      if (!attachment.includes("amazonaws.com")) continue;
      let s3ItemKey = attachment.split("/").pop(); // the last part of the url is the key of the object in s3
      console.log("s3 item key", s3ItemKey);
      const s3DeleteResult = await s3.send(new DeleteObjectCommand({
        Bucket: 'scrapbook-into-the-redwoods',
        Key: s3ItemKey
      }));
      console.log("s3 delete result", s3DeleteResult);
    }
    console.log('API Response:', update);

    return res.status(200).send({message: "Post Deleted"});
  } catch (e) {
    console.error('Error deleting post:', e);
    return res.status(500).json({ error: true, message: 'Internal Server Error' });
  }
};
