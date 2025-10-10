const { PrismaClient } = require('@prisma/client')
const fetch = require("node-fetch")

let failed = []

let prisma = new PrismaClient()

async function migrateAccounts(){
    let accounts = await fetch("http://scrappy-hackclub.herokuapp.com/api/accounts").then(r => r.json())
    for(let x=22; x < accounts.length; x++){
		let account
		let profile
		let newAccount
		try {
            account = accounts[x]
            profile = await fetch(
			  `https://slack.com/api/users.info?user=${account.slackID}&pretty=1`,{
				headers: {
				  Authorization: `Bearer XXX`
				}
			  }
			).then((r) => r.json())
            newAccount = await prisma.accounts.create({
				data: {
					...account,
					email: profile.user.profile.email || undefined
				}
			})
            // console.log(`Just created ${newAccount.username}. Email: ${newAccount.email}`)
            if(x < 5){
                // console.log(account)
                // console.log(newAccount)
                // console.log(profile)
            }
        }
		catch(e){
            // console.log(e)
            // console.log(account)
            // console.log(newAccount)
            // console.log(profile)
            failed.push(account.slackID)
        }
	}
    // console.log(failed)
}

async function migrateUpdates(){
	let updates = await fetch("http://scrappy-hackclub.herokuapp.com/api/updates").then(r => r.json())
	const createMany = await prisma.updates.createMany({
	  data: updates.map(update => ({...update, clubscrapID: undefined})),
	  skipDuplicates: true, // Skip 'Bobo'
	})
}

async function migrateEmojiReactions(){
	let emojiReactions = await fetch("http://scrappy-hackclub.herokuapp.com/api/emojiReactions").then(r => r.json())
	const createMany = await prisma.emojiReactions.createMany({
	  data: emojiReactions,
	  skipDuplicates: true, // Skip 'Bobo'
	})
}

async function migrateEmojiType(){
	let emojiTypes = await fetch("http://scrappy-hackclub.herokuapp.com/api/emojiType").then(r => r.json())
	const createMany = await prisma.emojiType.createMany({
	  data: emojiTypes,
	  skipDuplicates: true, // Skip 'Bobo'
	})
}

migrateEmojiReactions()