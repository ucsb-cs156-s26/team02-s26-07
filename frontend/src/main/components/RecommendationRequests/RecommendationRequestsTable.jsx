import React from "react";
import OurTable, { ButtonColumn } from "main/components/OurTable";

import { useBackendMutation } from "main/utils/useBackend";
import {
  cellToAxiosParamsDelete,
  onDeleteSuccess,
} from "main/utils/RecommendationRequestUtils";
import { useNavigate } from "react-router";
import { hasRole } from "main/utils/useCurrentUser";

export default function RecommendationRequestsTable({
  recommendationRequests,
  currentUser,
}) {
  const navigate = useNavigate();

  const editCallback = (cell) => {
    navigate(`/recommendationrequests/edit/${cell.row.original.id}`);
  };

  // Stryker disable all : hard to test for query caching

  const deleteMutation = useBackendMutation(
    cellToAxiosParamsDelete,
    { onSuccess: onDeleteSuccess },
    ["/api/recommendationrequests/all"],
  );
  // Stryker restore all

  // Stryker disable next-line all : TODO try to make a good test for this
  const deleteCallback = async (cell) => {
    deleteMutation.mutate(cell);
  };

  const columns = [
    {
      header: "id",
      accessorKey: "id", // accessor is the "key" in the data
    },
    {
      header: "RequesterEmail",
      accessorKey: "requesterEmail",
    },
    {
      header: "ProfessorEmail",
      accessorKey: "professorEmail",
    },
    {
      header: "Explanation",
      accessorKey: "explanation",
    },
    {
      header: "DateRequested",
      accessorKey: "dateRequested",
    },
    {
      header: "DateNeeded",
      accessorKey: "dateNeeded",
    },
    {
      header: "Done",
      accessorKey: "done",
      cell: (info) => (info.getValue() ? "Yes" : "No"),
    },
  ];

  if (hasRole(currentUser, "ROLE_ADMIN")) {
    columns.push(
      ButtonColumn(
        "Edit",
        "primary",
        editCallback,
        "RecommendationRequestsTable",
      ),
    );
    columns.push(
      ButtonColumn(
        "Delete",
        "danger",
        deleteCallback,
        "RecommendationRequestsTable",
      ),
    );
  }

  return (
    <OurTable
      data={recommendationRequests}
      columns={columns}
      testid={"RecommendationRequestsTable"}
    />
  );
}
