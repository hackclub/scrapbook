import { Box, Badge, Card, Text, Image, Grid, Avatar, Flex } from 'theme-ui'
import { timeSince } from '../lib/dates'
import { filter } from 'lodash'
import Link from 'next/link'
import SlideUp from './slide-up'

const avatars = {
  msw: 'max',
  zrl: 'zach',
  lachlanjc: 'lachlan',
  melody: 'orpheus'
}

const Post = ({
  profile = false,
  username,
  streakDisplay,
  streakCount,
  text,
  attachments = [],
  postedAt
}) => (
  <SlideUp as={Card} sx={{ width: '100%' }}>
    <Link href="/[profile]" as={`/${username}`} passHref>
      <Flex
        as="a"
        sx={{
          color: 'inherit',
          textDecoration: 'none',
          alignItems: 'center',
          mb: 3
        }}
      >
        {!profile && (
          <Avatar
            src={`https://hackclub.com/team/${avatars[username] ||
              username}.jpg`}
            size={48}
            mr={2}
            alt={username}
          />
        )}
        <Text variant="subheadline" my={0}>
          @{username}
        </Text>
        {streakDisplay && (
          <Badge
            ml={2}
            sx={{
              bg: 'cyan',
              borderRadius: 'circle',
              minWidth: 20,
              lineHeight: '20px',
              verticalAlign: 'middle',
              textAlign: 'center'
            }}
          >
            {streakCount}
          </Badge>
        )}
        <Text as="time" variant="caption" sx={{ ml: 'auto' }}>
          {timeSince(postedAt)}
        </Text>
      </Flex>
    </Link>
    <Text as="p" fontSize={3}>
      {text}
    </Text>
    {attachments.length > 0 && (
      <>
        <Text as="p" variant="caption" mt={2}>
          {attachments.length}
          {' attachment'}
          {attachments.length !== 1 ? 's' : ''}
        </Text>
        <Grid gap={2} columns={2} sx={{ alignItems: 'center', mt: 2 }}>
          {filter(attachments, a => a.type.startsWith('image')).map(img => (
            <Box
              as="a"
              href={img.thumbnails.full.url}
              target="_blank"
              sx={{
                width: '100%',
                gridColumn: attachments.length === 1 ? 'span 2' : 'initial',
                lineHeight: 0
              }}
            >
              <Image
                alt={img.filename}
                src={img.thumbnails.large.url}
                sx={{
                  width: '100%',
                  maxHeight: '100%',
                  borderRadius: 'default',
                  bg: 'sunken'
                }}
              />
            </Box>
          ))}
          {filter(attachments, a => a.type.startsWith('video')).map(vid => (
            <Box
              as="video"
              controls
              alt={vid.filename}
              src={vid.url}
              onMouseOver={event => event.target.play()}
              onMouseOut={event => event.target.pause()}
              sx={{
                gridColumn: 'span 2',
                width: '100%',
                maxHeight: 256,
                borderRadius: 'default',
                bg: 'sunken'
              }}
            />
          ))}
        </Grid>
      </>
    )}
  </SlideUp>
)

export default Post
