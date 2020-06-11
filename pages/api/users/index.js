export const getRawUsers = () =>
  fetch(
    'https://api2.hackclub.com/v0.1/Summer%20of%20Making%20Streaks/Slack%20Accounts'
  ).then(r => r.json())

export const getProfiles = () =>
  getRawUsers().then(users =>
    users.map(user => ({
      id: user?.id,
      username: user?.fields['Username'] || '',
      css: user?.fields['CSS URL'] || null,
      streakDisplay: user?.fields['Display Streak'] || false,
      streakCount: user?.fields['Streak Count'] || 1
    }))
  )

export default async (req, res) => getProfiles().then(u => res.json(u || []))
