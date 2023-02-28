import md5 from 'md5'

export const emailToPfp = email => {
  if (email == '') return ''

  return (
    'https://www.gravatar.com/avatar/' +
    md5(email.toLowerCase().trim()) +
    '?d=identicon&r=pg'
  )
}
