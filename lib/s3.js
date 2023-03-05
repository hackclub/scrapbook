import AWS from 'aws-sdk'

const s3 = new AWS.S3({
  // endpoint: `https://scrapbook-into-the-redwoods.s3.us-east-1.amazonaws.com`,
  accessKeyId: process.env.NEXT_PUBLIC_S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.NEXT_PUBLIC_S3_SECRET_ACCESS_KEY
  // signatureVersion: 'v4',
})

export default s3
