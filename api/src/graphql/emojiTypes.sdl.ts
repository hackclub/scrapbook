export const schema = gql`
  type Emoji {
    id: String!
    name: String!
    source: String
    reactions: [Reaction!]
  }

  type Query {
    emojis: [Emoji!]! @requireAuth
    emoji(id: String!): Emoji @requireAuth
  }

  input CreateEmojiInput {
    name: String!
    source: String
  }

  input UpdateEmojiInput {
    name: String
    source: String
  }

  type Mutation {
    createEmoji(input: CreateEmojiInput!): Emoji! @requireAuth
    updateEmoji(id: String!, input: UpdateEmojiInput!): Emoji!
      @requireAuth
    deleteEmoji(id: String!): Emoji! @requireAuth
  }
`
