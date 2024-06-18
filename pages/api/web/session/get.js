import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import prisma from '../../../../lib/prisma';

export default async (req, res) => {
    const session = await getServerSession(req, res, authOptions);

    if (!session?.user) {
        console.log('Unauthorized access attempt');
        return res.status(401).send({ message: "Unauthorized" });
    }

    try {
        const update = await prisma.session.findFirst({
            where: {
                userId: req.body.id
            },
            orderBy: {
                expires: 'desc'
            }
        });
        if (update) {
            const userId = update.userId;
            return res.status(200).send({ message: userId });
        }
        return res.status(200).send({ message: false });
    } catch (e) {
        console.error('Error deleting post:', e);
        return res.status(500).json({ error: true, message: 'Internal Server Error' });
    }
};
