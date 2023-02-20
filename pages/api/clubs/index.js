import prisma from '../../../lib/prisma';

export const getRawClubs = (where = undefined) => prisma.club.findMany({ where });

export default async (req, res) => getRawClubs().then(u => res.json(u || []));
