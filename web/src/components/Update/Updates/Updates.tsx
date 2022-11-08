import type {
  DeleteUpdateMutationVariables,
  CreateReactionInput,
  UpdateReactionInput,
  FindUpdates,
} from 'types/graphql'

import MuxPlayer from '@mux/mux-player-react'

import { useAuth } from '@redwoodjs/auth'
import { Link, routes } from '@redwoodjs/router'
import { useMutation } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'

import { QUERY } from 'src/components/Update/UpdatesCell'

const DELETE_UPDATE_MUTATION = gql`
  mutation DeleteUpdateMutation($id: String!) {
    deleteUpdate(id: $id) {
      id
    }
  }
`

const CREATE_REACTION_MUTATION = gql`
  mutation CreateReactionMutation($input: CreateReactionInput!) {
    createReaction(input: $input) {
      id
    }
  }
`

const UPDATE_REACTION_MUTATION = gql`
  mutation UpdateReactionMutation(
    $id: String!
    $input: UpdateReactionInput!
  ) {
    updateReaction(id: $id, input: $input) {
      id
    }
  }
`

const MAX_STRING_LENGTH = 150

const truncate = (value: string | number) => {
  const output = value?.toString()
  if (output?.length > MAX_STRING_LENGTH) {
    return output.substring(0, MAX_STRING_LENGTH) + '...'
  }
  return output ?? ''
}

const timeTag = (datetime?: string) => {
  return (
    datetime && (
      <time dateTime={datetime} title={datetime}>
        {new Date(datetime).toUTCString()}
      </time>
    )
  )
}

const UpdatesList = ({ updates }: FindUpdates) => {
  const [deleteUpdate] = useMutation(DELETE_UPDATE_MUTATION, {
    onCompleted: () => {
      toast.success('Update deleted')
    },
    onError: (error) => {
      toast.error(error.message)
    },
    refetchQueries: [{ query: QUERY }],
    awaitRefetchQueries: true,
  })

  const [createReaction] = useMutation(CREATE_REACTION_MUTATION, {
    onCompleted: () => {
      toast.success('Emoji added')
    },
    onError: (error) => {
      toast.error(error.message)
    },
    refetchQueries: [{ query: QUERY }],
    awaitRefetchQueries: true,
  })

  const [updateReaction] = useMutation(UPDATE_REACTION_MUTATION, {
    onCompleted: () => {
      toast.success('Reaction updated')
    },
    onError: (error) => {
      toast.error(error.message)
    },
    refetchQueries: [{ query: QUERY }],
    awaitRefetchQueries: true,
  })

  const onDeleteClick = (id: DeleteUpdateMutationVariables['id']) => {
    if (confirm('Are you sure you want to delete update ' + id + '?')) {
      deleteUpdate({ variables: { id } })
    }
  }

  const onAddEmojiClick = (
    id: DeleteUpdateMutationVariables['id'],
    userId: number
  ) => {
    let emoji = prompt('Which emoji?', 'grin')
    createReaction({
      variables: {
        input: { updateId: id, emojiName: emoji, usersReacted: [userId] },
      },
    })
  }

  const onEmojiClick = (
    id: DeleteUpdateMutationVariables['id'],
    emoji: string,
    usersReacted: number[],
    userId: number,
    reactionId: string
  ) => {
    usersReacted = usersReacted.includes(userId)
      ? [...usersReacted.filter((x) => x != userId)]
      : [...usersReacted, userId]
    console.log(reactionId)
    updateReaction({
      variables: {
        id: reactionId,
        input: {
          updateId: id,
          emojiName: emoji,
          usersReacted: usersReacted,
        },
      },
    })
  }

  const { currentUser } = useAuth()

  return (
    <div className="rw-segment rw-table-wrapper-responsive grid grid-cols-3 border-b-0">
      {updates.map((update) => (
        <div key={update.id} className="border-r border-b p-3">
          <p className="mb-2">
          <Link to={routes.user({username: truncate(update.account.username)})} className="text-purple">
            <b>@{truncate(update.account.username)}</b></Link>
          </p>
          <p>{truncate(update.text)}</p>
          <div className="grid grid-cols-2">
            {update.muxPlaybackIDs.map((id, index) => (
              <MuxPlayer
                streamType="on-demand"
                playbackId={id}
              />
            ))}
            {update.muxPlaybackIDs.length == 0 && update.attachments.map((attachment, index) => (
              <img
                src={attachment}
                key={`${update.id}-attachment-${index}`}
                className="bg-gray-200 my-2 rounded-md border"
                alt={`Project by ${truncate(update.account.username)}.`}
              />
            ))}
          </div>
          <div className="text-gray-500 text-center">
            {timeTag(update.postTime)}
          </div>
          <div>
            {update.reactions
              .filter((reaction) => reaction.usersReacted.length != 0)
              .map((reaction) => (
                <span
                  style={{
                    fontWeight: reaction.usersReacted.includes(currentUser?.id)
                      ? 800
                      : 400,
                  }}
                  onClick={() =>
                    onEmojiClick(
                      update.id,
                      reaction.emojiName,
                      reaction.usersReacted,
                      currentUser.id,
                      reaction.id
                    )
                  }
                >
                  {/* emojis whose source is a URL are rendered as images */}
                  <>
                    {reaction.emoji.source.includes('http') ? (
                      <img
                        src={reaction.emoji.source}
                        alt={reaction.emoji.source}
                        className="inline-block w-6 h-6"
                      />
                    ) : (
                      <span
                        className="inline-block w-6 h-6"
                        role="img"
                        aria-label={reaction.emoji.source}
                      >
                        {reaction.emoji.source}
                      </span>
                    )}

                    {reaction.usersReacted.length}
                  </>
                </span>
              ))}
          </div>
          <nav className="rw-table-actions mt-2 mb-1 justify-center">
            {update.accountID == currentUser?.id && (
              <>
                <Link
                  to={routes.editUpdate({ id: update.id })}
                  title={'Edit update ' + update.id}
                  className="rw-button rw-button-small rw-button-blue"
                >
                  Edit
                </Link>
                <button
                  type="button"
                  title={'Delete update ' + update.id}
                  className="rw-button rw-button-small rw-button-red"
                  onClick={() => onDeleteClick(update.id)}
                >
                  Delete
                </button>
              </>
            )}
            <button
              type="button"
              title={'Add emoji to update ' + update.id}
              className="rw-button rw-button-small text-purple"
              onClick={() => onAddEmojiClick(update.id, currentUser?.id)}
            >
              Add Emoji
            </button>
          </nav>
        </div>
      ))}
    </div>
  )
}

export default UpdatesList
