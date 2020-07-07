/*
import { at, sample } from 'lodash'
import { colors } from '@hackclub/theme'

const palette = at(colors, ['red', 'orange', 'yellow', 'green', 'cyan', 'blue'])
const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('')
const getColor = (id = 'a') =>
  palette[alphabet.indexOf(id.substring(0, 1)) % palette.length] || palette[0]
export const makeAvatar = (username = '') =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(
    username
  ).replace(/\%20/g, '+')}&size=192&background=${getColor(username).replace('#', '')}&color=fff`
*/

const full = `?select=${JSON.stringify({
  filterByFormula: '{Full Slack Member?} = 1'
})}`
export const getRawUsers = (onlyFull = false) =>
  fetch(
    'https://airbridge.hackclub.com/v0.1/Summer%20of%20Making%20Streaks/Slack%20Accounts' +
      (onlyFull ? full : '')
  ).then(r => r.json())

export const transformUser = (user = {}) => ({
  id: user?.id,
  username: user?.fields['Username'] || null,
  avatar: user?.fields['Avatar']?.[0]?.thumbnails?.large?.url || null,
  css: user?.fields['CSS URL'] || null,
  audio: user?.fields['Audio URL'] || null,
  streakCount: user?.fields['Streak Count'] || 1,
  slack: user?.fields['ID'] || '',
  github: user?.fields['GitHub'] || null,
  website: user?.fields['Website'] || null
})

export const getProfiles = () =>
  getRawUsers().then(users => users.map(transformUser))

export default async (req, res) => getProfiles().then(u => res.json(u || []))
