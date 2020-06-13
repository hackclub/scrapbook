import AirtablePlus from 'airtable-plus'
const FormData = require('form-data')

export const accountsTable = new AirtablePlus({
  apiKey: process.env.AIRTABLE_API_KEY,
  baseID: 'appRxhF9qVMLbxAXR',
  tableName: 'Slack Accounts'
})

export const updatesTable = new AirtablePlus({
  apiKey: process.env.AIRTABLE_API_KEY,
  baseID: 'appRxhF9qVMLbxAXR',
  tableName: 'Updates'
})

export const displayStreaks = async (userId, streakCount) => {
  const user = await fetch(`https://slack.com/api/users.profile.get?token=${process.env.SLACK_BOT_TOKEN}&user=${userId}`).then(r => r.json())
  const statusText = user.profile.status_text

  const canDisplay = await canDisplayStreaks(userId)
  if (canDisplay) {
    await fetch('https://slack.com/api/users.profile.set', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SLACK_USER_TOKEN}`
      },
      body: JSON.stringify({
        user: userId,
        profile: {
          'status_text': statusText,
          'status_emoji': streakCount <= 7 ? `:streak-${streakCount}:` : `:streak-7+:`,
          'status_expiration': 0
        }
      })
    })
  } else {
    await fetch('https://slack.com/api/users.profile.set', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SLACK_USER_TOKEN}`
      },
      body: JSON.stringify({ user: userId, profile: { 'status_text': '', 'status_emoji': `` } })
    })
  }
}

export const canDisplayStreaks = async (userId) => {
  let record = await getUserRecord(userId)
  return record.fields['Display Streak']
}

export const getUserRecord = async (userId) => {
  const user = await fetch(`https://slack.com/api/users.profile.get?token=${process.env.SLACK_BOT_TOKEN}&user=${userId}`).then(r => r.json())
  const github = user.profile.fields['Xf0DMHFDQA'].value || null
  const website = user.profile.fields['Xf5LNGS86L'].value || null
  const avatar = user.profile.image_192

  let record
  record = (await accountsTable.read({
    filterByFormula: `{ID} = '${userId}'`,
    maxRecords: 1
  }))[0]
  if (typeof record === 'undefined') {
    let profile = await fetch(`https://slack.com/api/users.info?token=${process.env.SLACK_BOT_TOKEN}&user=${userId}`).then(r => r.json())
    let username = profile.user.name
    record = await accountsTable.create({
      'ID': userId,
      'Username': username,
      'Streak Count': 0,
      'Website': website,
      'GitHub': github,
      'Attachments': [
        {
          'url': avatar
        }
      ]
    })
  }
  return record
}

export const getPublicFileUrl = async (urlPrivate) => {
  const filename = urlPrivate.split('/').pop()
  const file = await fetch(urlPrivate, {
    headers: {
      'Authorization': `Bearer ${process.env.SLACK_BOT_TOKEN}`
    }
  })
  const blob = await file.blob()

  let form = new FormData();
  form.append('file', blob.stream(), {
    filename: filename,
    knownLength: blob.size
  })

  const uploadResp = await fetch('https://bucky-hackclub.herokuapp.com', {
    method: 'POST',
    body: form
  })
  const uploadedUrl = await uploadResp.text()
  return uploadedUrl
}

export const sendCommandResponse = (responseUrl, text) => {
  fetch(responseUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      text: text,
      response_type: 'ephemeral'
    })
  })
}