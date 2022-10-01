export const schema = gql`
  type Account {
    id: Int!
    email: String
    hashedPassword: String
    salt: String
    resetToken: String
    resetTokenExpiresAt: DateTime
    webAuthnChallenge: String
    slackID: String
    username: String!
    timezone: String!
    timezoneOffset: Int!
    streakCount: Int
    maxStreaks: Int
    displayStreak: Boolean
    streaksToggledOff: Boolean
    customDomain: String
    cssURL: String
    website: String
    github: String
    fullSlackMember: Boolean
    avatar: String
    webring: [String!]
    pronouns: String
    customAudioURL: String
    lastUsernameUpdatedTime: DateTime
    webhookURL: String
    updates: [Update!]
    newMember: Boolean
  }

  type Query {
    accounts: [Account!]! @requireAuth
    account(id: Int!): Account @requireAuth
  }

  input CreateAccountInput {
    email: String
    hashedPassword: String
    salt: String
    resetToken: String
    resetTokenExpiresAt: DateTime
    webAuthnChallenge: String
    slackID: String
    username: String!
    timezone: String!
    timezoneOffset: Int!
    streakCount: Int
    maxStreaks: Int
    displayStreak: Boolean
    streaksToggledOff: Boolean
    customDomain: String
    cssURL: String
    website: String
    github: String
    fullSlackMember: Boolean
    avatar: String
    webring: [String!]
    pronouns: String
    customAudioURL: String
    lastUsernameUpdatedTime: DateTime
    webhookURL: String
    newMember: Boolean
  }

  input UpdateAccountInput {
    email: String
    hashedPassword: String
    salt: String
    resetToken: String
    resetTokenExpiresAt: DateTime
    webAuthnChallenge: String
    slackID: String
    username: String
    timezone: String
    timezoneOffset: Int
    streakCount: Int
    maxStreaks: Int
    displayStreak: Boolean
    streaksToggledOff: Boolean
    customDomain: String
    cssURL: String
    website: String
    github: String
    fullSlackMember: Boolean
    avatar: String
    webring: [String!]
    pronouns: String
    customAudioURL: String
    lastUsernameUpdatedTime: DateTime
    webhookURL: String
    newMember: Boolean
  }

  type Mutation {
    createAccount(input: CreateAccountInput!): Account! @requireAuth
    updateAccount(id: Int!, input: UpdateAccountInput!): Account! @requireAuth
    deleteAccount(id: Int!): Account! @requireAuth
  }
`
