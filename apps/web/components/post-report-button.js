import { useState } from 'react'
import toast from 'react-hot-toast'

const PostReportButton = ({ postId }) => {
  const [submitting, setSubmitting] = useState(false)
  const [reported, setReported] = useState(false)

  const reportPost = async () => {
    setSubmitting(true)
    try {
      const response = await fetch(
        `/api/posts/${encodeURIComponent(postId)}/report`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({})
        }
      )
      const result = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(result.message || 'Could not report this post.')
      }

      setReported(true)
      toast.success(
        result.alreadyReported
          ? 'You already reported this post.'
          : 'Report sent to the moderation team.'
      )
    } catch (error) {
      toast.error(error.message || 'Could not report this post.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <button
      type="button"
      className="post-report-button"
      aria-label={reported ? 'Post reported' : 'Report this post'}
      disabled={submitting || reported}
      onClick={reportPost}
    >
      {submitting ? 'Sending…' : reported ? 'Reported' : 'Report'}
    </button>
  )
}

export default PostReportButton
