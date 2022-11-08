export const schema = gql`
  type Update {
    id: String!
    accountID: Int
    postTime: DateTime
    text: String
    attachments: [String!]
    muxAssetIDs: [String!]
    muxPlaybackIDs: [String!]
    muxAssetStatuses: String
    messageTimestamp: Float
    backupAssetID: String
    backupPlaybackID: String
    isLargeVideo: Boolean
    channel: String
    clubscrapID: String
    account: Account
    reactions: [Reaction!]
  }

  input AccountFilter {
    username: String
  }

  input UsersReactedFilter {
    isEmpty: Boolean
  }

  input SomeEmojiFilter {
    emojiName: String
    accountsReacted: UsersReactedFilter
  }

  input ReactionsFilter {
    some: SomeEmojiFilter
  }

  input UpdatesFilter {
    account: AccountFilter
    reactions: ReactionsFilter
  }

  type Query {
    updates(filter: UpdatesFilter): [Update!]! @skipAuth
    update(id: String!): Update @requireAuth
  }

  input CreateUpdateInput {
    accountID: Int
    postTime: DateTime
    text: String
    attachments: [String!]
    muxAssetIDs: [String!]
    muxPlaybackIDs: [String!]
    muxAssetStatuses: String
    messageTimestamp: Float
    backupAssetID: String
    backupPlaybackID: String
    isLargeVideo: Boolean
    channel: String
    clubscrapID: String
  }

  input UpdateUpdateInput {
    accountID: Int
    postTime: DateTime
    text: String
    attachments: [String!]
    muxAssetIDs: [String!]
    muxPlaybackIDs: [String!]
    muxAssetStatuses: String
    messageTimestamp: Float
    backupAssetID: String
    backupPlaybackID: String
    isLargeVideo: Boolean
    channel: String
    clubscrapID: String
  }

  type Mutation {
    createUpdate(input: CreateUpdateInput!): Update! @requireAuth
    updateUpdate(id: String!, input: UpdateUpdateInput!): Update!
      @requireAuth
      @requireUpdateOwnership
    deleteUpdate(id: String!): Update! @requireAuth @requireUpdateOwnership
  }
`
