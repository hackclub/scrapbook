import prisma from '../../../lib/prisma'

export const searchUsers = async query => {
  //see if data contains search query
  const result = await prisma.accounts.findMany({
    where: {
      username: {
        contains: query
      }
    }
  })

  return result
}

export default async (req, res) => {
  const { query } = req.body

  searchUsers(query)

  res.json(searchResult)
}
