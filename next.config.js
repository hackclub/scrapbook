const withMDX = require('@next/mdx')({ extension: /\.mdx?$/ })
module.exports = withMDX({
  pageExtensions: ['js', 'jsx', 'mdx'],
  trailingSlash: true,
  images: {
    imageSizes: [18, 24, 48, 96],
    domains: [
      'dl.airtable.com',
      'emoji.slack-edge.com',
      'cloud-lp0r5yk68.vercel.app'
    ]
  },
  async rewrites() {
    return [
      {
        source: '/attachments/:path*{/}?',
        destination: 'https://dl.airtable.com/.attachmentThumbnails/:path*'
      },
      {
        source: '/customizer/',
        destination: 'https://scrapbook-customizer.vercel.app/'
      },
      {
        source: '/customizer/(.*)/',
        destination: 'https://scrapbook-customizer.vercel.app/$1'
      },
      {
        source: '/api/emoji/',
        destination: 'https://badger.hackclub.dev/api/emoji'
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
        source: '/api/emoji/',
        headers: [
          {
            key: 'Cache-Control',
            value: 'max-age=1000, stale-while-revalidate'
          }
        ]
      },
      {
        source: '/attachments/(.+)/',
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
