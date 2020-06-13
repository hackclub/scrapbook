import AirtablePlus from 'airtable-plus'

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
  let user = await fetch(`https://slack.com/api/users.info?token=${process.env.SLACK_BOT_TOKEN}&user=${userId}`).then(r => r.json())
  let statusText = user.user.profile.status_text

  let canDisplay = await canDisplayStreaks(userId)
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

export const getUserRecord = async userId => {
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
      'Streak Count': 0
    })
  }
  return record
}

export const clearStatus = async userId => {

}

export const makeFilePublic = async (fileId, fileName) => {
  const publicFile = await fetch('https://slack.com/api/files.sharedPublicURL', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.SLACK_USER_TOKEN}`
    },
    body: JSON.stringify({ file: fileId })
  }).then(r => r.json())
  const acceptedFileTypes = ['jpg', 'jpeg', 'png', 'gif', 'mp4', 'mov']
  const containsAcceptedFileTypes = acceptedFileTypes.some(el => fileName.toLowerCase().includes(el))
  if (containsAcceptedFileTypes) {
    const pubSecret = publicFile.split('-')[2]
    const imgUrl = `https://files.slack.com/files-pri/T0266FRGM-${fileId}/${fileName}?pub_secret=${pubSecret}`
    console.log(imgUrl)
    return imgUrl
  }
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