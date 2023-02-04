const withMDX = require('@next/mdx')({ extension: /\.mdx?$/ })
module.exports = withMDX({
  experimental: { optimizeFonts: true },
  pageExtensions: ['js', 'jsx', 'mdx'],
  trailingSlash: false,
  images: {
    imageSizes: [18, 36, 54, 24, 48, 72, 96, 144],
    domains: [
      'dl.airtable.com',
      'emoji.slack-edge.com',
      'cloud-lp0r5yk68.vercel.app',
      'avatars.slack-edge.com',
      'secure.gravatar.com',
      'i.imgur.com',
      'www.gravatar.com'
    ]
  },
  async rewrites() {
    return [
      { source: '/summer', destination: '/r/summer-of-making' },
      {
        source: '/attachments/:path*{/}?',
        destination: 'https://dl.airtable.com/.attachmentThumbnails/:path*'
      },
      {
        source: '/customizer',
        destination: 'https://scrapbook-customizer.vercel.app/'
      },
      {
        source: '/customizer/(.*)',
        destination: 'https://scrapbook-customizer.vercel.app/$1'
      },
      {
        source: '/avatar/(.*)',
        destination: 'https://scrapbook.hackclub.com/api/users/$1/avatar'
      },
      {
        source: '/(.*).png',
        destination: 'https://scrapbook.hackclub.com/api/users/$1/avatar'
      },
      {
        source: '/api/emoji',
        destination: 'https://badger.hackclub.dev/api/emoji'
      },
      {
        source: '/:username.rss',
        destination: '/api/rss/:username'
      }
    ]
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [{ key: 'Access-Control-Allow-Origin', value: '*' }]
      },
      {
        source: '/api/emoji',
        headers: [
          {
            key: 'Cache-Control',
            value: 'max-age=1000, stale-while-revalidate'
          }
        ]
      },
      {
        source: '/attachments/(.+)',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type' },
          {
            key: 'Cache-Control',
            value: 'public, max-age=60000, immutable'
          }
        ]
      }
    ]
  }
})
