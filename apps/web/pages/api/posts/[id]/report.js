import { createHash } from 'node:crypto'
import prisma from '../../../../lib/prisma'
import { requireServerAuthSession } from '../../../../lib/auth-session'

const MAX_POST_REPORTS_PER_HOUR = 10

const hashText = text =>
  createHash('sha256')
    .update(text || '', 'utf8')
    .digest('hex')

export default async function handler(req, res) {
  const session = await requireServerAuthSession(req, res)
  if (!session) return

  const updateId = req.query.id
  if (typeof updateId !== 'string' || !updateId) {
    return res.status(400).json({ error: true, message: 'Invalid post.' })
  }

  try {
    const result = await prisma.$transaction(async tx => {
      const update = await tx.updates.findUnique({
        where: { id: updateId },
        select: { id: true, text: true, accountsID: true }
      })
      if (!update || !update.accountsID) {
        return { status: 404, message: 'Post not found.' }
      }

      const existingReport = await tx.scrapbookPostReport.findUnique({
        where: {
          updateId_reporterAccountId: {
            updateId,
            reporterAccountId: session.user.id
          }
        },
        select: { id: true }
      })
      if (existingReport) {
        return { status: 200, alreadyReported: true }
      }

      const existingReview = await tx.moderationReview.findUnique({
        where: { updateId }
      })
      if (existingReview?.status === 'processing') {
        return {
          status: 409,
          message: 'A moderator is reviewing this post right now.'
        }
      }

      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${session.user.id}, 0))`

      const contentHash = hashText(update.text)

      const recentReportCount = await tx.scrapbookPostReport.count({
        where: {
          reporterAccountId: session.user.id,
          createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) }
        }
      })
      if (recentReportCount >= MAX_POST_REPORTS_PER_HOUR) {
        return {
          status: 429,
          message: 'You have reached the hourly report limit.'
        }
      }

      const report = await tx.scrapbookPostReport.createMany({
        data: [
          {
            updateId,
            reporterAccountId: session.user.id,
            reporterUsername: session.user.username
          }
        ],
        skipDuplicates: true
      })
      if (!report.count) {
        return { status: 200, alreadyReported: true }
      }

      if (!existingReview) {
        await tx.moderationReview.createMany({
          data: [
            {
              updateId,
              contentHash,
              flaggedTerms: [],
              flaggedCategories: []
            }
          ],
          skipDuplicates: true
        })
      } else if (
        existingReview.status !== 'pending' ||
        existingReview.contentHash !== contentHash
      ) {
        const contentChanged = existingReview.contentHash !== contentHash
        await tx.moderationReview.update({
          where: { id: existingReview.id },
          data: {
            contentHash,
            ...(contentChanged
              ? { flaggedTerms: [], flaggedCategories: [] }
              : {}),
            status: 'pending',
            rejectionReason: null,
            reviewedBy: null,
            reviewedAt: null
          }
        })
      }

      return { status: 202, alreadyReported: false }
    })

    if (result.status === 202 || result.status === 200) {
      return res.status(result.status).json({
        reported: true,
        alreadyReported: result.alreadyReported
      })
    }

    return res
      .status(result.status)
      .json({ error: true, message: result.message })
  } catch (error) {
    console.error('Could not record Scrapbook post report:', error)
    return res
      .status(500)
      .json({ error: true, message: 'Could not send your report.' })
  }
}
