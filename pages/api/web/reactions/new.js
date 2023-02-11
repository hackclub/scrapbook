import prisma from '../../../../lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';

export default async (req, res) => {
	const session = await getServerSession(req, res, authOptions);
	if (session?.user === undefined) {
		res.json({ error: true, message: 'User undefined.' });
	}
	const upsertEmoji = await prisma.emojiType.upsert({
		where: {
			name: req.query.emojiName,
		},
		update: {
			emojiReactions: {
				upsert: [
					{
						create: {
							id: `${req.query.post}-${req.query.emojiName}`,
							updateId: req.query.post,
							usersReacted: [session.user.id],
						},
						update: { usersReacted: { push: session.user.id } },
						where: {
							id: `${req.query.post}-${req.query.emojiName}`,
							updateId: req.query.post,
							usersReacted: {
								has: session.user.id,
							},
						},
					},
				],
			},
		},
		create: {
			name: req.query.emojiName,
			emojiSource: req.query.emoji,
			emojiReactions: {
				create: {
					updateId: req.query.post,
					usersReacted: [session.user.id],
					id: `${req.query.post}-${req.query.emojiName}`,
				},
			},
		},
	});
	console.log(upsertEmoji);
	res.json(upsertEmoji);
};
