export const schema = gql`
  type Club {
    id: String!
    slug: String!
    name: String!
    logo: String!
    customDomain: String
    cssURL: String
    website: String
    github: String
    members: [ClubMember]!
    updates: [ClubUpdate]!
  }

  type Query {
    clubs: [Club!]! @requireAuth
    club(id: String!): Club @requireAuth
  }

  input CreateClubInput {
    slug: String!
    name: String!
    logo: String!
    creator: Int
    customDomain: String
    cssURL: String
    website: String
    github: String
  }

  input UpdateClubInput {
    slug: String
    name: String
    logo: String
    customDomain: String
    cssURL: String
    website: String
    github: String
  }

  type Mutation {
    createClub(input: CreateClubInput!): Club! @requireAuth
    updateClub(id: String!, input: UpdateClubInput!): Club! @requireClubAdmin
    deleteClub(id: String!): Club! @requireClubAdmin
  }
`
