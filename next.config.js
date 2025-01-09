const withMDX = require('@next/mdx')({ extension: /\.mdx?$/ })
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE == 'true'
});

let nextConfig = withMDX({
  pageExtensions: ['js', 'jsx', 'mdx'],
  trailingSlash: false,
  images: {
    imageSizes: [18, 36, 54, 24, 48, 72, 96, 144],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'dl.airtable.com'
      },
      {
        protocol: 'https', 
        hostname: 'emoji.slack-edge.com'
      },
      {
        protocol: 'https',
        hostname: 'cloud-lp0r5yk68.vercel.app'
      },
      {
        protocol: 'https',
        hostname: 'avatars.slack-edge.com'
      },
      {
        protocol: 'https',
        hostname: 'secure.gravatar.com'
      },
      {
        protocol: 'https',
        hostname: 'i.imgur.com'
      },
      {
        protocol: 'https',
        hostname: 'www.gravatar.com'
      },
      {
        protocol: 'https',
        hostname: 'ca.slack-edge.com'
      },
      {
        protocol: 'https',
        hostname: 'scrapbook-into-the-redwoods.s3.amazonaws.com'
      },
      {
        protocol: 'https',
        hostname: 'scrapbook-into-the-redwoods.s3.us-east-1.amazonaws.com'
      },
      {
        protocol: 'https',
        hostname: 'imgutil.s3.us-east-2.amazonaws.com'
      }
    ],
    formats: ['image/webp']
  },
  async rewrites() {
    return [
      { source: '/summer', destination: '/r/summer-of-making' },
      { source: '/new', destination: '/' },
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
      },
      {
        source: '/auth/error:path*{/}',
        destination: '/404'
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
        source: "/api/css",
        headers: [
          {
            key: "Content-Type",
            value: "text/css;charset=UTF-8"
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
  },
  experimental: {
    swcPlugins: [
      'next-superjson-plugin',
      { excluded: [] }
    ]
  }
})

module.exports = withBundleAnalyzer(nextConfig);