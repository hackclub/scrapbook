export const schema = gql`
  type Reaction {
    id: String!
    updateId: String
    emojiName: String
    accountsReacted: [Int!]
    updatedAt: DateTime!
    emoji: Emoji
    update: Update
  }

  type Query {
    reactions: [Reaction!]! @requireAuth
    reaction(id: String!): Reaction @requireAuth
  }

  input CreateReactionInput {
    updateId: String
    emojiName: String
    accountsReacted: [Int!]
  }

  input UpdateReactionInput {
    updateId: String
    emojiName: String
    accountsReacted: [Int!]
  }

  type Mutation {
    createReaction(input: CreateReactionInput!): Reaction! @requireAuth
    updateReaction(id: String!, input: UpdateReactionInput!): Reaction!
      @requireAuth
    deleteReaction(id: String!): Reaction! @requireAuth
  }
`
