import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import prisma from '../../../../lib/prisma';
import GithubSlugger from 'github-slugger';
import normalizeUrl from 'normalize-url';

const slugger = new GithubSlugger();

export default async (req, res) => {
	const session = await getServerSession(req, res, authOptions);
	if (session?.user === undefined) {
		res.redirect(`/?errorTryAgain`);
	}
	let update = await prisma.club.create({
		data: {
			slug: slugger.slug(req.query.text),
			name: req.query.text,
			website: req.query.website ? normalizeUrl(req.query.website, { forceHttps: true }) : null,
			logo: req.query.website ? `https://unavatar.io/${normalizeUrl(req.query.website, { stripProtocol: true })}` : 'https://assets.hackclub.com/icon-square.png',
			members: {
				create: { accountId: session.user.id, admin: true },
			},
		},
	});
	res.redirect(`/?successfullyPosted`);
};
