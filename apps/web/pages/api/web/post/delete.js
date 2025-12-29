import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import prisma from '../../../../lib/prisma';
import s3 from '../../../../lib/s3';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';

export default async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: true, message: 'Method Not Allowed' });
  }

  const session = await getServerSession(req, res, authOptions);

  if (!session?.user) {
    // console.log('Unauthorized access attempt');
    return res.status(401).json({ error: true, message: 'Unauthorized' });
  }

  try {
    const id = req.body?.id;
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: true, message: 'Missing or invalid post id' });
    }

    const update = await prisma.updates.findUnique({
      where: { id },
      select: {
        id: true,
        accountsID: true,
        accountsSlackID: true,
        attachments: true,
        ClubUpdate: { select: { clubId: true } }
      }
    });

    if (!update) {
      return res.status(404).json({ error: true, message: 'Post not found' });
    }

    const isOwnerByAccountId =
      !!update.accountsID && update.accountsID === session.user.id;
    const isOwnerBySlackId =
      !!update.accountsSlackID &&
      !!session.user.slackID &&
      update.accountsSlackID === session.user.slackID;

    let isClubAdmin = false;
    if (update.ClubUpdate?.clubId) {
      const adminMembership = await prisma.clubMember.findFirst({
        where: {
          clubId: update.ClubUpdate.clubId,
          accountId: session.user.id,
          admin: true
        },
        select: { id: true }
      });
      isClubAdmin = !!adminMembership;
    }

    if (!isOwnerByAccountId && !isOwnerBySlackId && !isClubAdmin) {
      return res.status(403).json({ error: true, message: 'Forbidden' });
    }

    await prisma.updates.delete({ where: { id: update.id } });

    for (let attachment of update.attachments) {
      // console.log("attachment", attachment);
      if (!attachment.includes("amazonaws.com")) continue;
      let s3ItemKey = attachment.split("/").pop(); // the last part of the url is the key of the object in s3
      // console.log("s3 item key", s3ItemKey);
      const s3DeleteResult = await s3.send(new DeleteObjectCommand({
        Bucket: 'scrapbook-into-the-redwoods',
        Key: s3ItemKey
      }));
      // console.log("s3 delete result", s3DeleteResult);
    }
    // console.log('API Response:', update);

    return res.status(200).json({ message: 'Post Deleted' });
  } catch (e) {
    // console.error('Error deleting post:', e);
    return res.status(500).json({ error: true, message: 'Internal Server Error' });
  }
};
