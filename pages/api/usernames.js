import { map } from 'lodash'
import { allowAllOrigins } from '../../lib/api'

export const getUsernames = () =>
  fetch(
    'https://airbridge.hackclub.com/v0.1/Summer%20of%20Making%20Streaks/Slack%20Accounts'
  )
    .then(r => r.json())
    .then(u => map(u, 'fields.Username'))

export default async (req, res) =>
  getUsernames().then(u => allowAllOrigins(res).json(u || []))
