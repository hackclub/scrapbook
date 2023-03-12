import { useRouter } from 'next/router'
import { useState } from 'react'
import useSWR from 'swr'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import Image from 'next/image'
import Head from 'next/head'
import Meta from '@hackclub/meta'
import CalendarHeatmap from '@hackclub/react-calendar-heatmap'
import Icon from '@hackclub/icons'
import Banner from '../../components/banner'
import Content from '../../components/content'
import Message from '../../components/message'
import { StaticMention } from '../../components/mention'
import Post from '../../components/post'
import AudioPlayer from '../../components/audio-player'
import ExamplePosts from '../../components/example-posts'
import FourOhFour from '../404'
import { clamp } from 'lodash'
import normalizeUrl from 'normalize-url'
import { useSession } from 'next-auth/react'
import { ClubsEditPopup } from '../../components/clubs-edit-popup'
import { ClubsMemberPopup } from '../../components/clubs-member-popup'

const HOST =
  process.env.NODE_ENV === 'development' ? '' : 'https://scrapbook.hackclub.com'

const Tooltip = dynamic(() => import('react-tooltip'), { ssr: false })

const Club = ({ club = {}, posts = [], children, session }) => {
  const [clubsEditOpen, setClubsEditOpen] = useState(false)
  const [clubsMemberOpen, setClubsMemberOpen] = useState(false)
  return (
    <>
      <ClubsEditPopup
        closed={!clubsEditOpen}
        setClubsOpen={setClubsEditOpen}
        session={session}
        club={club}
      />
      <ClubsMemberPopup
        closed={!clubsMemberOpen}
        setClubsOpen={setClubsMemberOpen}
        session={session}
        club={club}
      />
      <main
        className="container"
        style={{
          backgroundImage: `linear-gradient(90deg, rgba(5, 11, 20, 0.7) 0%, rgba(5, 11, 20, 0.7) 100%), url("${club.banner}")`,
          maxWidth: 'none',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover'
        }}
      >
        <Meta
          as={Head}
          name="Hack Club Scrapbook"
          title={`${club.name}`}
          description={`Follow @${club.name}’s progress making things together.`}
          image={`https://workshop-cards.hackclub.com/${
            club.name
          }.png?brand=Scrapbook${club.logo ? `&images=${club.logo}` : ''}`}
        />
        {club.cssURL && (
          <link
            rel="stylesheet"
            type="text/css"
            href={HOST + `/api/css?url=${club.cssURL}`}
          />
        )}
        {children}
        <header
          className="header"
          style={{ maxWidth: '72rem', margin: 'auto', padding: '0.5rem 1rem' }}
        >
          <div className="header-col-1">
            {club.logo && (
              <img
                src={club.logo}
                key={club.logo}
                width={96}
                height={96}
                alt={club.name}
                className="header-title-avatar"
              />
            )}
            <section>
              <h1 className="header-title-name club-name">{club.name}</h1>
              <div className="header-content">
                <div className="header-links">
                  {club.github && (
                    <a
                      href={club.github}
                      target="_blank"
                      className="header-link club-header-link header-link-github"
                    >
                      <Icon size={24} glyph="github" />
                      {normalizeUrl(club.github, { stripProtocol: true })}
                    </a>
                  )}
                  {club.website && (
                    <a
                      href={club.website}
                      target="_blank"
                      className="header-link club-header-link header-link-website"
                    >
                      <Icon size={24} glyph="link" />
                      {normalizeUrl(club.website, { stripProtocol: true })}
                    </a>
                  )}
                </div>
              </div>
            </section>
          </div>
          {club.description && <><aside className="header-col-2" aria-hidden />
          <aside className="header-col-3" style={{display: 'flex', alignItems: 'center'}}>
            <div className="post" style={{borderRadius: 'var(--radii-default)'}}>
            <Content>{club.description}</Content>
            </div>
          </aside></>}
        </header>
      </main>
      <main className="container">
        <article className="posts club-posts">
          {posts.map(post => (
            <Post key={post.id} user={post.Accounts} {...post} />
          ))}
          {posts.length <= 1 && (
            <ExamplePosts club={posts.length == 0 ? true : false} />
          )}
        </article>
        {club.cssURL && (
          <footer className="css" title="External CSS URL">
            <Icon
              glyph="embed"
              size={32}
              className="css-icon"
              aria-label="Code link icon"
            />
            <a
              href={
                club.cssURL.includes('gist.githubusercontent')
                  ? club.cssURL
                      .replace('githubusercontent.', 'github.')
                      .split('/raw')?.[0]
                  : club.cssURL
              }
              target="_blank"
              className="css-link"
            >
              CSS:{' '}
              {club.cssURL.includes('gist.githubusercontent')
                ? `Gist by @${club.cssURL.split('.com/')?.[1]?.split('/')?.[0]}`
                : club.cssURL}
            </a>
          </footer>
        )}
      </main>
      {session?.user['ClubMember']
        .filter(x => x.clubId == club.id)
        .filter(x => x.admin == true).length > 0 && (
        <div
          style={{
            position: 'fixed',
            bottom: '32px',
            right: '32px',
            display: 'flex'
          }}
        >
          <div
            style={{
              height: '48px',
              width: '48px',
              borderRadius: '999px',
              alignItems: 'center',
              justifyContent: 'center',
              display: 'flex',
              background: 'var(--colors-orange)',
              marginRight: '12px',
              cursor: 'pointer'
            }}
            onClick={() => setClubsEditOpen(true)}
          >
            <Icon glyph="controls" />
          </div>
          <div
            style={{
              height: '48px',
              width: '48px',
              borderRadius: '999px',
              alignItems: 'center',
              justifyContent: 'center',
              display: 'flex',
              background: 'var(--colors-red)',
              cursor: 'pointer'
            }}
            onClick={() => setClubsMemberOpen(true)}
          >
            <Icon glyph="friend" />
          </div>
        </div>
      )}
    </>
  )
}

const fetcher = url => fetch(url).then(r => r.json())

const Page = ({ slug = '', router = {}, initialData = {} }) => {
  const { data, error } = useSWR(
    `/api/clubs/${initialData.club.slug}/`,
    fetcher,
    {
      fallbackData: initialData,
      refreshInterval: 5000
    }
  )
  const { data: session, status } = useSession()
  if (!data) {
    return <Message text="Loading…" />
  } else if (error && !data) {
    return <Message text="Error" color1="orange" color2="pink" />
  } else {
    return <Club {...data} session={session} />
  }
}

const UserPage = props => {
  const router = useRouter()

  if (router.isFallback) {
    return <Message text="Loading…" />
  } else if (props.club?.slug) {
    return (
      <Page username={props.club.slug} router={router} initialData={props} />
    )
  } else {
    return <FourOhFour />
  }
}

export default UserPage

export const getStaticPaths = async () => {
  const paths = []
  return { paths, fallback: true }
}

export const getStaticProps = async ({ params }) => {
  const { getClub, getPosts } = require('../api/clubs/[slug]/index')
  if (params.slug?.length < 2) return console.error('No slug!') || { props: {} }

  const club = await getClub(params.slug)
  if (!club || !club?.slug) return console.error('No club!') || { props: {} }

  try {
    const posts = await getPosts(club)
    return {
      props: { club, posts },
      revalidate: 1
    }
  } catch (error) {
    console.error(error)
    return { props: { club }, revalidate: 1 }
  }
}
