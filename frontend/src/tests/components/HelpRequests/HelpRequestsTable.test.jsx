import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import { helpRequestFixtures } from "fixtures/helpRequestFixtures";
import HelpRequestsTable from "main/components/HelpRequests/HelpRequestsTable";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import { currentUserFixtures } from "fixtures/currentUserFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

vi.mock("react-toastify", () => ({
  toast: vi.fn(),
}));
import { toast } from "react-toastify"; // for stryker

const mockedNavigate = vi.fn();
vi.mock("react-router", async () => {
  const originalModule = await vi.importActual("react-router");
  return {
    ...originalModule,
    useNavigate: () => mockedNavigate,
  };
});

describe("HelpRequestsTable tests", () => {
  const queryClient = new QueryClient();

  test("Has the expected column headers and content for ordinary user", () => {
    const currentUser = currentUserFixtures.userOnly;

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <HelpRequestsTable
            helpRequests={helpRequestFixtures.threeHelpRequests}
            currentUser={currentUser}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const expectedHeaders = [
      "id",
      "RequesterEmail",
      "TeamId",
      "TableOrBreakoutRoom",
      "RequestTime",
      "Explanation",
      "Solved",
    ];
    const expectedFields = [
      "id",
      "requesterEmail",
      "teamId",
      "tableOrBreakoutRoom",
      "requestTime",
      "explanation",
      "solved",
    ];
    const testId = "HelpRequestsTable";

    expectedHeaders.forEach((headerText) => {
      expect(screen.getByText(headerText)).toBeInTheDocument();
    });

    expectedFields.forEach((field) => {
      expect(
        screen.getByTestId(`${testId}-cell-row-0-col-${field}`),
      ).toBeInTheDocument();
    });

    expect(screen.getByTestId(`${testId}-cell-row-0-col-id`)).toHaveTextContent(
      "3",
    );

    expect(
      screen.queryByTestId(`${testId}-cell-row-0-col-Edit-button`),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByTestId(`${testId}-cell-row-0-col-Delete-button`),
    ).not.toBeInTheDocument();
  });

  test("Has the expected column headers and content for adminUser", () => {
    const currentUser = currentUserFixtures.adminUser;

    const helpRequestsWithSolvedTrue = [
      {
        ...helpRequestFixtures.threeHelpRequests[0],
        solved: true,
      },
      ...helpRequestFixtures.threeHelpRequests.slice(1),
    ];

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <HelpRequestsTable
            helpRequests={helpRequestsWithSolvedTrue}
            currentUser={currentUser}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const expectedHeaders = [
      "id",
      "RequesterEmail",
      "TeamId",
      "TableOrBreakoutRoom",
      "RequestTime",
      "Explanation",
      "Solved",
    ];
    const expectedFields = [
      "id",
      "requesterEmail",
      "teamId",
      "tableOrBreakoutRoom",
      "requestTime",
      "explanation",
      "solved",
    ];
    const testId = "HelpRequestsTable";

    expectedHeaders.forEach((headerText) => {
      expect(screen.getByText(headerText)).toBeInTheDocument();
    });

    expectedFields.forEach((field) => {
      expect(
        screen.getByTestId(`${testId}-cell-row-0-col-${field}`),
      ).toBeInTheDocument();
    });

    expect(screen.getByTestId(`${testId}-cell-row-0-col-id`)).toHaveTextContent(
      "3",
    );

    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-solved`),
    ).toHaveTextContent("Yes");

    expect(
      screen.getByTestId(`${testId}-cell-row-2-col-solved`),
    ).toHaveTextContent("No");

    const editButton = screen.getByTestId(
      `${testId}-cell-row-0-col-Edit-button`,
    );
    expect(editButton).toBeInTheDocument();
    expect(editButton).toHaveClass("btn-primary");

    const deleteButton = screen.getByTestId(
      `${testId}-cell-row-0-col-Delete-button`,
    );
    expect(deleteButton).toBeInTheDocument();
    expect(deleteButton).toHaveClass("btn-danger");
  });

  test("Edit button navigates to the edit page for admin user", async () => {
    const currentUser = currentUserFixtures.adminUser;

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <HelpRequestsTable
            helpRequests={helpRequestFixtures.threeHelpRequests}
            currentUser={currentUser}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByTestId("HelpRequestsTable-cell-row-0-col-id"),
      ).toHaveTextContent("3");
    });

    const editButton = screen.getByTestId(
      "HelpRequestsTable-cell-row-0-col-Edit-button",
    );

    fireEvent.click(editButton);

    await waitFor(() =>
      expect(mockedNavigate).toHaveBeenCalledWith("/helprequests/edit/3"),
    );
  });

  test("Delete button calls delete callback", async () => {
    const currentUser = currentUserFixtures.adminUser;

    const axiosMock = new AxiosMockAdapter(axios);
    axiosMock
      .onDelete("/api/helprequests")
      .reply(200, { message: "HelpRequest with id 3 deleted" });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <HelpRequestsTable
            helpRequests={helpRequestFixtures.threeHelpRequests}
            currentUser={currentUser}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByTestId("HelpRequestsTable-cell-row-0-col-id"),
      ).toHaveTextContent("3");
    });

    const deleteButton = screen.getByTestId(
      "HelpRequestsTable-cell-row-0-col-Delete-button",
    );

    fireEvent.click(deleteButton);

    await waitFor(() => expect(axiosMock.history.delete.length).toBe(1));
    expect(axiosMock.history.delete[0].params).toEqual({ id: 3 });
    expect(axiosMock.history.delete[0].url).toBe("/api/helprequests");
    expect(toast).toHaveBeenCalledWith({
      message: "HelpRequest with id 3 deleted",
    });
  });
});
