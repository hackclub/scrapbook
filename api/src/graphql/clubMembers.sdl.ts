export const schema = gql`
  type ClubMember {
    id: String!
    accountId: Int!
    account: Account!
    clubId: String!
    club: Club!
  }

  type Query {
    clubMembers: [ClubMember!]! @requireAuth
    clubMember(id: String!): ClubMember @requireAuth
  }

  input CreateClubMemberInput {
    accountId: Int!
    clubId: String!
  }

  input UpdateClubMemberInput {
    accountId: Int
    clubId: String
  }

  type Mutation {
    createClubMember(input: CreateClubMemberInput!): ClubMember! @requireAuth
    updateClubMember(id: String!, input: UpdateClubMemberInput!): ClubMember!
      @requireAuth
    deleteClubMember(id: String!): ClubMember! @requireAuth
  }
`
