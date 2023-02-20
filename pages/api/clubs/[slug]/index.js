import { map, find, isEmpty, orderBy } from 'lodash';
import { getRawPosts, transformPost } from '../../posts';
import prisma from '../../../../lib/prisma';

export const getClub = async (value, field = 'slug') => {
	let where = {};
	where[field] = value;
	const opts = {
		where,
	};
	console.log(opts);
	const club = await prisma.club.findFirst(opts);
	if (!club) console.error('Could not fetch club', value);
	return club && club?.slug ? club : {};
};

export const getPosts = async (club, max = null) => {
	const allUpdates = await getRawPosts(max, {
		where: {
			ClubUpdate: {
				club: {
					slug: club.slug,
				},
			},
		},
	});

	if (!allUpdates) console.error('Could not fetch posts');
	return allUpdates.map(p => transformPost(p));
};

export default async (req, res) => {
	const club = await getClub(req.query.slug);
	if (!club?.name) return res.status(404).json({ status: 404, error: 'Cannot locate club' });
	const posts = (await getPosts(club, req.query.max ? Number(req.query.max) : null)) || [];
	res.json({ club, posts });
};
