import Link from 'next/link'
import { EmojiImg } from './emoji'
import { startCase } from 'lodash'

const Reaction = ({ name, char, url }) => (
  <Link href={`/r/${name}`} prefetch={false}>
    <a className="post-reaction" title={startCase(name)}>
      {url && <EmojiImg src={url} name={name} width={24} height={24} />}
      {char}
    </a>
  </Link>
)

export default Reaction
