const withMDX = require('@next/mdx')({ extension: /\.mdx?$/ })
module.exports = withMDX({
  pageExtensions: ['js', 'jsx', 'mdx'],
  trailingSlash: true,
  async rewrites() {
    return [
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
  }
})
