export const proxy = str =>
  str
    ? str.replace(
        'https://dl.airtable.com/.attachmentThumbnails',
        '/attachments'
      ) + '/'
    : ''
