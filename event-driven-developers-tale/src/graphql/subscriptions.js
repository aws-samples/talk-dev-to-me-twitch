/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onVacationRequestNotification = /* GraphQL */ `
  subscription OnVacationRequestNotification($owner: String) {
    onVacationRequestNotification(owner: $owner) {
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
export const onDeleteVacationRequest = /* GraphQL */ `
  subscription OnDeleteVacationRequest {
    onDeleteVacationRequest {
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
