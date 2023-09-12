import prisma from '../../../lib/prisma'
import metrics from "../../../metrics";

export const getRawClubs = async (where = undefined) => {
  try {
    const rawClubs = await prisma.club.findMany({ where })
    metrics.increment("success.get_raw_clubs", 1);
    return rawClubs;
  } catch {
    metrics.increment("errors.get_raw_clubs", 1);
    return [];
  }
}

export default async (req, res) => getRawClubs().then(u => res.json(u || []))
