const withMDX = require('@next/mdx')({ extension: /\.mdx?$/ })
module.exports = withMDX({
  experimental: { trailingSlash: true },
  pageExtensions: ['js', 'jsx', 'mdx']
})
