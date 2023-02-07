import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';

export default async (req, res) => {
	console.log(authOptions);
	const session = await getServerSession(req, res, authOptions);
	if (session?.user === undefined) {
		res.redirect(`/?errorTryAgain`);
	}
	console.log(session);
	let update = await prisma.updates.create({
		data: {
			accountsID: session.user.id,
			text: req.query.text,
			attachments: JSON.parse(req.query.attachments),
		},
		include: {
			Accounts: true,
		},
	});
	res.redirect(`/?successfullyPosted`);
};
