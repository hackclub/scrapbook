export const schema = gql`
  type EmojiType {
    id: String!
    name: String!
    emojiSource: String
    emojiReactions: [EmojiReaction!]
  }

  type Query {
    emojiTypes: [EmojiType!]! @requireAuth
    emojiType(id: String!): EmojiType @requireAuth
  }

  input CreateEmojiTypeInput {
    name: String!
    emojiSource: String
  }

  input UpdateEmojiTypeInput {
    name: String
    emojiSource: String
  }

  type Mutation {
    createEmojiType(input: CreateEmojiTypeInput!): EmojiType! @requireAuth
    updateEmojiType(id: String!, input: UpdateEmojiTypeInput!): EmojiType!
      @requireAuth
    deleteEmojiType(id: String!): EmojiType! @requireAuth
  }
`
