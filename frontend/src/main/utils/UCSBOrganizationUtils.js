import { toast } from "react-toastify";

// Stryker disable next-line all
export function onDeleteSuccess(message) {
  console.log(message);
  toast(message.message || message);
}

export function cellToAxiosParamsDelete(cell) {
  return {
    // Stryker disable next-line all
    url: "/api/ucsborganizations",
    method: "DELETE",
    params: {
      orgCode: cell.row.original.orgCode,
    },
  };
}
