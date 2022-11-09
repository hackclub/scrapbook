export const schema = gql`
  type ClubUpdate {
    id: String!
    updateId: String!
    update: Update!
    clubId: String!
    club: Club!
  }

  type Query {
    clubUpdates: [ClubUpdate!]! @requireAuth
    clubUpdate(id: String!): ClubUpdate @requireAuth
  }

  input CreateClubUpdateInput {
    updateId: String!
    clubId: String!
  }

  input UpdateClubUpdateInput {
    updateId: String
    clubId: String
  }

  type Mutation {
    createClubUpdate(input: CreateClubUpdateInput!): ClubUpdate! @requireAuth
    updateClubUpdate(id: String!, input: UpdateClubUpdateInput!): ClubUpdate!
      @requireAuth
    deleteClubUpdate(id: String!): ClubUpdate! @requireAuth
  }
`
