import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import prisma from '../../../../lib/prisma';

export default async (req, res) => {
	console.log(authOptions);
	const session = await getServerSession(req, res, authOptions);
	if (session?.user === undefined) {
		res.redirect(`/?errorTryAgain`);
	}
	await prisma.accounts.update({
		where: {
			id: session.user.id,
		},
		data: {
			username: req.query.username,
			email: req.query.email,
			website: req.query.website,
			pronouns: req.query.pronouns,
			cssURL: req.query.cssURL.includes('http://') || req.query.cssURL.includes('https://') || req.query.cssURL == '' ? req.query.cssURL : 'http://'.concat(req.query.cssURL),
			website: req.query.website.includes('http://') || req.query.website.includes('https://') || req.query.website == '' ? req.query.website : 'http://'.concat(req.query.website),
			github: req.query.github.includes('https://github.com/') || req.query.github.includes('http://github.com/') || req.query.github == '' ? req.query.github : 'https://github.com/'.concat(req.query.github),
		},
	});
	res.redirect(`/?successfullySaved`);
};
