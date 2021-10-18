/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getVacationRequest = /* GraphQL */ `
  query GetVacationRequest($id: ID!) {
    getVacationRequest(id: $id) {
      id
      category
      description
      approvalStatus
      startDate
      endDate
      approvedBy
      owner
      rejectionReason
      createdAt
      updatedAt
    }
  }
`;
export const listVacationRequests = /* GraphQL */ `
  query ListVacationRequests(
    $filter: ModelVacationRequestFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listVacationRequests(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        category
        description
        approvalStatus
        startDate
        endDate
        approvedBy
        owner
        rejectionReason
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
