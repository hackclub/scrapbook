import Link from 'next/link';
import { EmojiImg } from './emoji';
import { startCase } from 'lodash';

async function clickEmoji(name, postID) {
	let response = await fetch(`/api/web/reactions/click?emojiName=${name}&post=${postID}`);
	alert(response);
}

const Reaction = ({ name, char, url, postID, authStatus, usersReacted, authSession }) => {
	let children = (
		<>
			{url && <EmojiImg src={url} name={name} width={24} height={24} layout="responsive" />}
			{char}
		</>
	);
	return authStatus == 'authenticated' ? (
		<span className={`post-reaction ${usersReacted.includes(authSession.user.id) ? 'post-reaction-active' : ''}`} title={startCase(name)} onClick={() => clickEmoji(name, postID)}>
			{children}
		</span>
	) : (
		<Link href={`/r/${name}`}>
			<a className="post-reaction" title={startCase(name)}>
				{children}
			</a>
		</Link>
	);
};

export default Reaction;
