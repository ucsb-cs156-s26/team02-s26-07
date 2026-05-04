import React from "react";
import OurTable, { ButtonColumn } from "main/components/OurTable";

import { useBackendMutation } from "main/utils/useBackend";
//import {
//  onDeleteSuccess,
//  cellToAxiosParamsDelete,
//} from "main/utils/ArticleUtils";
import { useNavigate } from "react-router";
import { hasRole } from "main/utils/useCurrentUser";

function psppsp(cell) {
  return {
    method: "DELETE",
    params: {
      id: cell.row.original.id,
    },
  };
}

export default function ArticleTable({ dates, currentUser }) {
  const navigate = useNavigate();

  const editCallback = (cell) => {
    navigate(`/articles/edit/${cell.row.original.id}`);
  };

  // Stryker disable all : hard to test for query caching

  //const deleteMutation = useBackendMutation(
  //  cellToAxiosParamsDelete,
  //  { onSuccess: onDeleteSuccess },
  //  ["/api/articles/all"],
  //);
  // Stryker restore all
  const deleteMutation = useBackendMutation(
    psppsp,
    {},["/api/articles/all"], );

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
      header: "Title",
      accessorKey: "title",
    },
    {
      header: "Url",
      accessorKey: "url",
    },
    {
      header: "Explanation",
      accessorKey: "explanation",
    },
    {
      header: "Email",
      accessorKey: "email",
    },
    {
      header: "DateAdded",
      accessorKey: "dateAdded",
    },
  ];

  if (hasRole(currentUser, "ROLE_ADMIN")) {
    columns.push(ButtonColumn("Edit", "primary", editCallback, "ArticleTable"));
    columns.push(
      ButtonColumn("Delete", "danger", deleteCallback, "ArticleTable"),
    );
  }

  return <OurTable data={dates} columns={columns} testid={"ArticleTable"} />;
}
