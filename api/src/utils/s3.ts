import AWS from 'aws-sdk'

console.log(process.env.S3_ACCESS_KEY_ID, process.env.S3_SECRET_ACCESS_KEY)

const s3 = new AWS.S3({
  // endpoint: `https://scrapbook-into-the-redwoods.s3.us-east-1.amazonaws.com`,
  accessKeyId: process.env.S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  // signatureVersion: 'v4',
})

export default s3
