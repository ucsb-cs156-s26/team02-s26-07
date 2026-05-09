import React from "react";
import OurTable, { ButtonColumn } from "main/components/OurTable";

import { useBackendMutation } from "main/utils/useBackend";
import {
  cellToAxiosParamsDelete,
  onDeleteSuccess,
} from "main/utils/helpRequestUtils";
import { useNavigate } from "react-router";
import { hasRole } from "main/utils/useCurrentUser";

export default function HelpRequestsTable({ helpRequests, currentUser }) {
  const navigate = useNavigate();

  const editCallback = (cell) => {
    navigate(`/helprequest/edit/${cell.row.original.id}`);
  };

  // Stryker disable all : hard to test for query caching

  const deleteMutation = useBackendMutation(
    cellToAxiosParamsDelete,
    { onSuccess: onDeleteSuccess },
    ["/api/helprequests/all"],
  );
  // Stryker restore all

  // Stryker disable next-line all : TODO try to make a good test for this
  const deleteCallback = async (cell) => {
    deleteMutation.mutate(cell);
  };

  const columns = [
    {
      header: "id",
      accessorKey: "id",
    },
    {
      header: "RequesterEmail",
      accessorKey: "requesterEmail",
    },
    {
      header: "TeamId",
      accessorKey: "teamId",
    },
    {
      header: "TableOrBreakoutRoom",
      accessorKey: "tableOrBreakoutRoom",
    },
    {
      header: "RequestTime",
      accessorKey: "requestTime",
    },
    {
      header: "Explanation",
      accessorKey: "explanation",
    },
    {
      header: "Solved",
      accessorKey: "solved",
      cell: (info) => (info.getValue() ? "Yes" : "No"),
    },
  ];

  if (hasRole(currentUser, "ROLE_ADMIN")) {
    columns.push(
      ButtonColumn("Edit", "primary", editCallback, "HelpRequestsTable"),
    );
    columns.push(
      ButtonColumn("Delete", "danger", deleteCallback, "HelpRequestsTable"),
    );
  }

  return (
    <OurTable
      data={helpRequests}
      columns={columns}
      testid={"HelpRequestsTable"}
    />
  );
}
