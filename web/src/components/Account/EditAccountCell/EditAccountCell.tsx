import type { EditAccountById, UpdateAccountInput } from 'types/graphql'

import { navigate, routes } from '@redwoodjs/router'
import type { CellSuccessProps, CellFailureProps } from '@redwoodjs/web'
import { useMutation } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'

import AccountForm from 'src/components/Account/AccountForm'

export const QUERY = gql`
  query EditAccountById($id: Int!) {
    account: account(id: $id) {
      id
      email
      hashedPassword
      salt
      resetToken
      resetTokenExpiresAt
      webAuthnChallenge
      slackID
      username
      timezone
      timezoneOffset
      streakCount
      maxStreaks
      displayStreak
      streaksToggledOff
      customDomain
      cssURL
      website
      github
      fullSlackMember
      avatar
      webring
      pronouns
      customAudioURL
      lastUsernameUpdatedTime
      webhookURL
      newMember
    }
  }
`
const UPDATE_ACCOUNT_MUTATION = gql`
  mutation UpdateAccountMutation($id: Int!, $input: UpdateAccountInput!) {
    updateAccount(id: $id, input: $input) {
      id
      email
      hashedPassword
      salt
      resetToken
      resetTokenExpiresAt
      webAuthnChallenge
      slackID
      username
      timezone
      timezoneOffset
      streakCount
      maxStreaks
      displayStreak
      streaksToggledOff
      customDomain
      cssURL
      website
      github
      fullSlackMember
      avatar
      webring
      pronouns
      customAudioURL
      lastUsernameUpdatedTime
      webhookURL
      newMember
    }
  }
`

export const Loading = () => <div>Loading...</div>

export const Failure = ({ error }: CellFailureProps) => (
  <div className="rw-cell-error">{error?.message}</div>
)

export const Success = ({ account }: CellSuccessProps<EditAccountById>) => {
  const [updateAccount, { loading, error }] = useMutation(
    UPDATE_ACCOUNT_MUTATION,
    {
      onCompleted: () => {
        toast.success('Account updated')
        navigate(routes.home())
      },
      onError: (error) => {
        toast.error(error.message)
      },
    }
  )

  const onSave = (
    input: UpdateAccountInput,
    id: EditAccountById['account']['id']
  ) => {
    updateAccount({ variables: { id, input } })
  }

  return (
    <div className="rw-segment">
      <header className="rw-segment-header">
        <h2 className="rw-heading rw-heading-secondary">Edit Your Account</h2>
      </header>
      <div className="rw-segment-main">
        <AccountForm account={account} onSave={onSave} error={error} loading={loading} />
      </div>
    </div>
  )
}
