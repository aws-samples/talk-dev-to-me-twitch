import { useState, useEffect } from "react";
import { API } from "aws-amplify";
import { listVacationRequests } from "../graphql/queries";
import {
  updateVacationRequest,
  deleteVacationRequest,
} from "../graphql/mutations";
import AddVacation from "../components/AddVacation";
import moment from "moment";
import CustomTable from "../components/CustomTable";

function Vacations({ emmiter, user }) {
  emmiter.on("showModal", (visible, header, subtitle, component) => {
    getVacations();
  });

  const [vacations, setVacations] = useState([]);
  const [isApprover, setIsApprover] = useState(false);
  const [pendingApprovalSelected, setPendingApprovalSelected] = useState([]);
  const [comingUpSelected, setComingUpSelected] = useState([]);

  const headers = ["Name", "Start Date", "End Date", "Category", "Requester"];

  useEffect(() => {
    getVacations();
  });

  function checkIsApprover() {
    if (
      user?.signInUserSession.idToken.payload["cognito:groups"]?.includes(
        "Approvers"
      )
    ) {
      setIsApprover(true);
      return true;
    }

    return false;
  }

  async function getVacations() {
    let result;
    if (!checkIsApprover()) {
      const filter = {
        owner: {
          eq: user.username,
        },
      };

      result = await API.graphql({
        query: listVacationRequests,
        variables: { filter: filter },
        authMode: "AMAZON_COGNITO_USER_POOLS",
      });
    } else {
      result = await API.graphql({
        query: listVacationRequests,
        authMode: "AMAZON_COGNITO_USER_POOLS",
      });
    }

    setVacations(result.data.listVacationRequests?.items);
  }

  async function approveVacations() {
    let input;

    pendingApprovalSelected.forEach(async (id) => {
      input = {
        id: id,
        approvalStatus: "APPROVED",
      };

      await API.graphql({
        query: updateVacationRequest,
        variables: { input: input },
        authMode: "AMAZON_COGNITO_USER_POOLS",
      });
    });

    setPendingApprovalSelected([]);
    await getVacations();
  }

  async function deleteVacations() {
    let input;

    const fullList = pendingApprovalSelected.concat(comingUpSelected);

    // DELETE FROM LIST OF PENDING APPROVAL
    fullList.forEach(async (id) => {
      input = {
        id: id,
      };

      console.log("Deleting vacation: " + id);

      await API.graphql({
        query: deleteVacationRequest,
        variables: { input: input },
        authMode: "AMAZON_COGNITO_USER_POOLS",
      });
    });

    setPendingApprovalSelected([]);
    setComingUpSelected([]);
    await getVacations();
  }

  function showAddVacation() {
    emmiter.emit(
      "showModal",
      true,
      "New Vacation Request",
      "A good vacation description will help the approver.",
      <AddVacation emmiter={emmiter} />
    );
  }

  return (
    <div>
      <div className='border-b-2 flex items-center'>
        <h1 className='text-purple-600 flex-grow'>VACATIONS</h1>
        {/* Vacations */}
        {/* Header */}

        {/* Actions */}
        <div>
          {isApprover && (
            <button
              disabled={pendingApprovalSelected.length === 0}
              className='disabled:opacity-50 disabled:cursor-not-allowed bg-gray-100 text-base rounded text-gray-500 hover:bg-gray-50 transform transition shadow p-4 py-2 mr-4'
              onClick={approveVacations}
            >
              Approve
            </button>
          )}
          <button
            disabled={
              pendingApprovalSelected.length === 0 &&
              comingUpSelected.length === 0
            }
            className='disabled:opacity-50 disabled:cursor-not-allowed bg-gray-100 text-base rounded text-gray-500 hover:bg-gray-50 transform transition shadow p-4 py-2 mr-4'
            onClick={deleteVacations}
          >
            Delete
          </button>
          <button
            className='bg-purple-600 text-base rounded text-white hover:bg-purple-800 transform transition shadow p-4 py-2 my-4'
            onClick={showAddVacation}
          >
            Add
          </button>
        </div>
      </div>

      {/* List Categories */}
      {vacations.filter(
        (item) =>
          item.approvalStatus === "PENDING_APPROVAL" ||
          item.approvalStatus === "PENDING_VALIDATION"
      ).length > 0 && (
        <>
          <div className='flex justify-between'>
            <h3 className='text-xl mb-4 pt-4'>Pending approval</h3>
          </div>

          <CustomTable
            selectionSetter={setPendingApprovalSelected}
            emmiter={emmiter}
            headers={headers}
            rows={vacations.filter(
              (item) =>
                item.approvalStatus === "PENDING_APPROVAL" ||
                item.approvalStatus === "PENDING_VALIDATION"
            )}
          />
        </>
      )}

      {/* List Categories */}
      {vacations.filter(
        (item) =>
          item.approvalStatus === "APPROVED" &&
          item.endDate > `${moment().format("YYYY-MM-DD")}Z`
      ).length > 0 && (
        <>
          <div className='flex justify-between mt-6'>
            <h3 className='text-xl'>Coming up</h3>
          </div>

          <CustomTable
            selectionSetter={setComingUpSelected}
            headers={headers}
            rows={vacations.filter(
              (item) =>
                item.approvalStatus === "APPROVED" &&
                item.endDate > `${moment().format("YYYY-MM-DD")}Z`
            )}
          />
        </>
      )}

      {/* List Categories */}
      {vacations.filter(
        (item) =>
          item.approvalStatus === "APPROVED" &&
          item.endDate <= `${moment().format("YYYY-MM-DD")}Z`
      ).length > 0 && (
        <>
          <div className='flex justify-between mt-6'>
            <h3 className='text-xl'>Past vacations</h3>
          </div>

          <CustomTable
            readonly={true}
            headers={headers}
            rows={vacations.filter(
              (item) =>
                item.approvalStatus === "APPROVED" &&
                item.endDate <= `${moment().format("YYYY-MM-DD")}Z`
            )}
          />
        </>
      )}
    </div>
  );
}

export default Vacations;
