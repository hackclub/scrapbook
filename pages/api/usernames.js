import { map } from 'lodash'
import prisma from '../../lib/prisma'

export const getUsernames = () => prisma.accounts.findMany().then(u => map(u, 'username'))

export default async (req, res) => getUsernames().then(u => res.json(u || []))
