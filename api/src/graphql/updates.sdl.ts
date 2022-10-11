export const schema = gql`
  type Update {
    id: String!
    accountsID: Int
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
    Accounts: Account
    emojiReactions: [EmojiReaction!]
  }

  input AccountsFilter {
    username: String
  }

  input UpdatesFilter {
    Accounts: AccountsFilter
  }

  type Query {
    updates(filter: UpdatesFilter): [Update!]! @skipAuth
    update(id: String!): Update @requireAuth
  }

  input CreateUpdateInput {
    accountsID: Int
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
    accountsID: Int
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
