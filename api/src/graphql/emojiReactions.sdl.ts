export const schema = gql`
  type EmojiReaction {
    id: String!
    updateId: String
    emojiTypeName: String
    usersReacted: [Int!]
    updatedAt: DateTime!
    EmojiType: EmojiType
    update: Update
  }

  type Query {
    emojiReactions: [EmojiReaction!]! @requireAuth
    emojiReaction(id: String!): EmojiReaction @requireAuth
  }

  input CreateEmojiReactionInput {
    updateId: String
    emojiTypeName: String
    usersReacted: [Int!]
  }

  input UpdateEmojiReactionInput {
    updateId: String
    emojiTypeName: String
    usersReacted: [Int!]
  }

  type Mutation {
    createEmojiReaction(input: CreateEmojiReactionInput!): EmojiReaction!
      @requireAuth
    updateEmojiReaction(
      id: String!
      input: UpdateEmojiReactionInput!
    ): EmojiReaction! @requireAuth
    deleteEmojiReaction(id: String!): EmojiReaction! @requireAuth
  }
`
