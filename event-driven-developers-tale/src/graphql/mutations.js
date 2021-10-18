/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const submitVacationRequest = /* GraphQL */ `
  mutation SubmitVacationRequest($input: CreateVacationRequestInput!) {
    submitVacationRequest(input: $input) {
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
export const updateVacationRequest = /* GraphQL */ `
  mutation UpdateVacationRequest($input: UpdateVacationRequestInput!) {
    updateVacationRequest(input: $input) {
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
export const deleteVacationRequest = /* GraphQL */ `
  mutation DeleteVacationRequest(
    $input: DeleteVacationRequestInput!
    $condition: ModelVacationRequestConditionInput
  ) {
    deleteVacationRequest(input: $input, condition: $condition) {
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
