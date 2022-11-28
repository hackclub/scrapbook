import type {
  DeleteUpdateMutationVariables,
  CreateReactionInput,
  UpdateReactionInput,
  FindUpdates,
} from 'types/graphql'

import MuxPlayer from '@mux/mux-player-react/lazy'

import { useAuth } from '@redwoodjs/auth'
import { Link, routes } from '@redwoodjs/router'
import { useMutation, Head } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'

import { QUERY } from 'src/components/Update/UpdatesCell'
import React from 'react'

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
  mutation UpdateReactionMutation($id: String!, $input: UpdateReactionInput!) {
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

export type contextDataType = {
  name?: string
  logo?: string
  slug?: string
  pronouns?: string
  username?: string
  customAudioURL?: string
  avatar?: string
}

const UpdatesList = ({
  updates,
  Context,
  contextData,
}: FindUpdates & {
  Context?: React.FC<{ contextData: contextDataType }>
  contextData?: contextDataType
}) => {
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
      toast.remove()
      toast.success('Reactions updated!')
    },
    onError: (error) => {
      toast.remove()
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
        input: { updateId: id, emojiName: emoji, accountsReacted: [userId] },
      },
    })
  }

  const onEmojiClick = (
    id: DeleteUpdateMutationVariables['id'],
    emoji: string,
    accountsReacted: number[],
    userId: number,
    reactionId: string
  ) => {
    accountsReacted = accountsReacted.includes(userId)
      ? [...accountsReacted.filter((x) => x != userId)]
      : [...accountsReacted, userId]
    toast.loading(
      accountsReacted.includes(userId)
        ? 'Reacting...'
        : 'Removing your reaction...'
    )
    updateReaction({
      variables: {
        id: reactionId,
        input: {
          updateId: id,
          emojiName: emoji,
          accountsReacted: accountsReacted,
        },
      },
    })
  }

  const { currentUser } = useAuth()

  return (
    <div
      className="masonary"
      style={{ height: `${1000 * Math.floor(updates.length / 3) + 1}px` }}
    >
      {Context && <Context contextData={contextData} />}
      {updates.map((update) => (
        <div
          key={update.id}
          className="masonary-item height-100 flex flex-col rounded-md border border-sunken bg-background p-3"
        >
          <p className="mb-2 flex items-center">
            <Link
              to={routes.user({ username: truncate(update.account.username) })}
              className="text-purple"
            >
              <b>@{truncate(update.account.username)}</b>
            </Link>
            <div className="flex-grow"></div>
            <nav className="rw-table-actions mt-2 mb-1 flex items-center">
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
              {false && (
                <button
                  type="button"
                  title={'Add emoji to update ' + update.id}
                  className="rw-button rw-button-small text-purple"
                  onClick={() => onAddEmojiClick(update.id, currentUser?.id)}
                >
                  Add Emoji
                </button>
              )}
            </nav>
          </p>
          <p>{truncate(update.text)}</p>
          <div className="grid grid-cols-1">
            {update.muxPlaybackIDs.map((id, index) => (
              <MuxPlayer streamType="on-demand" playbackId={id} />
            ))}
            {update.muxPlaybackIDs.length == 0 &&
              update.attachments.map((attachment, index) => (
                <img
                  src={attachment}
                  key={`${update.id}-attachment-${index}`}
                  className="bg-gray-200 my-2 flex-grow rounded-md border"
                  alt={`Project by ${truncate(update.account.username)}.`}
                />
              ))}
          </div>
          <div className="text-gray-500 text-center">
            {timeTag(update.postTime)}
          </div>
          <div className="flex justify-center">
            {update.reactions
              // .filter((reaction) => reaction.accountsReacted.length != 0)
              .map((reaction) => (
                <span
                  className="my-2 cursor-pointer rounded-md bg-white px-3 py-1"
                  style={{
                    fontWeight: reaction.accountsReacted.includes(
                      currentUser?.id
                    )
                      ? 800
                      : 400,
                  }}
                  onClick={() =>
                    onEmojiClick(
                      update.id,
                      reaction.emojiName,
                      reaction.accountsReacted,
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
                        className="inline-block h-6 w-6"
                      />
                    ) : (
                      <span
                        className="inline-block h-6 w-6"
                        role="img"
                        aria-label={reaction.emoji.source}
                      >
                        {reaction.emoji.source}
                      </span>
                    )}

                    {reaction.accountsReacted.length}
                  </>
                </span>
              ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default UpdatesList
