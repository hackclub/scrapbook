import { find, compact, isEmpty } from 'lodash';
import { getRawUsers } from './users';
import { stripColons } from '../../lib/emoji';
import prisma from '../../lib/prisma';
import { emailToPfp } from '../../lib/email';

export const getRawPosts = async (max = null, params = {}, api = false) => {
	const opts = {
		orderBy: {
			postTime: 'desc',
		},
		include: {
			emojiReactions: {
				include: {
					EmojiType: true,
				},
			},
		},
		...params,
	};
	if (max) opts.take = max;
	const updates = await prisma.updates.findMany(opts);
	if (api) {
		let updatesWith;
	}
	return updates;
};

export const formatTS = ts => (ts ? new Date(ts * 1000).toISOString() : null);

export const transformReactions = (raw = []) =>
	compact(
		raw.map(emoji => {
			try {
				const { name, emojiSource } = emoji.EmojiType;
				if (name === 'aom') return null;
				const obj = { name };
				obj[emojiSource.startsWith('http') ? 'url' : 'char'] = emojiSource;
				return obj;
			} catch (e) {
				return null;
			}
		})
	);

export const transformPost = p => ({
	id: p.id,
	user: p.user
		? {
				...p.user,
				avatar: p.user.avatar || emailToPfp(p.user.email),
		  }
		: {},
	timestamp: p.messageTimestamp || null,
	slackUrl: p.messageTimestamp
		? `https://hackclub.slack.com/archives/${p.channel}/p${p.messageTimestamp
				.toString()
				.replace('.', '')
				.padEnd(16, '0')}`
		: null,
	postedAt: p.messageTimestamp ? formatTS(p.messageTimestamp) : new Date(p.postTime).toISOString(),
	text: p.text != null ? p.text : '',
	attachments: p.attachments,
	mux: p.muxPlaybackIDs,
	reactions: transformReactions(p.emojiReactions) || [],
});

export const getPosts = async (max = null, api = false) => {
	const users = await getRawUsers(true);
	return await getRawPosts(max, {}, api).then(posts =>
		posts
			.map(p => {
				p.user = find(users, { id: p.accountsID }) || {};
				return p;
			})
			.filter(p => !isEmpty(p.user))
			.map(p => transformPost(p))
	);
};

export default async (req, res) => {
	const posts = await getPosts(req.query.max ? Number(req.query.max) : 200, true);
	return res.json(posts);
};
