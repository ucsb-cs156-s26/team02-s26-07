import { render, waitFor, fireEvent, screen } from "@testing-library/react";
import HelpRequestForm from "main/components/HelpRequests/HelpRequestForm";
import { helpRequestFixtures } from "fixtures/helpRequestFixtures";
import { BrowserRouter as Router } from "react-router";
import { expect } from "vitest";

const mockedNavigate = vi.fn();
vi.mock("react-router", async () => {
  const originalModule = await vi.importActual("react-router");
  return {
    ...originalModule,
    useNavigate: () => mockedNavigate,
  };
});

describe("HelpRequestForm tests", () => {
  test("renders correctly", async () => {
    render(
      <Router>
        <HelpRequestForm />
      </Router>,
    );
    await screen.findByText(/Create/);
    await screen.findByText(/Id/);
    await screen.findByText(/Requester Email/);
    await screen.findByText(/Team Id/);
    await screen.findByText(/Table or Breakout Room/);
    await screen.findByText(/Request Time/);
    await screen.findByText(/Explanation/);
    await screen.findByText(/Solved/);

    expect(screen.getByTestId("HelpRequestForm-submit")).toHaveTextContent(
      "Create",
    );
    expect(screen.getByText(/Create/)).toBeInTheDocument();
  });

  test("renders correctly when passing in a HelpRequest", async () => {
    render(
      <Router>
        <HelpRequestForm initialContents={helpRequestFixtures.oneHelpRequest} />
      </Router>,
    );

    await screen.findByTestId(/HelpRequestForm-id/);
    expect(screen.getByTestId(/HelpRequestForm-id/)).toHaveValue(
      String(helpRequestFixtures.oneHelpRequest.id),
    );
    expect(screen.getByLabelText(/Requester Email/)).toHaveValue(
      helpRequestFixtures.oneHelpRequest.requesterEmail,
    );
    expect(screen.getByLabelText(/Team Id/)).toHaveValue(
      helpRequestFixtures.oneHelpRequest.teamId,
    );
    expect(screen.getByLabelText(/Table or Breakout Room/)).toHaveValue(
      helpRequestFixtures.oneHelpRequest.tableOrBreakoutRoom,
    );
    expect(screen.getByLabelText(/Request Time/)).toHaveValue(
      "2026-05-03T10:30:30.000",
    );
    expect(screen.getByLabelText(/Explanation/)).toHaveValue(
      helpRequestFixtures.oneHelpRequest.explanation,
    );
    expect(screen.getByTestId("HelpRequestForm-submit")).toHaveTextContent(
      "Create",
    );
  });

  test("Correct Error messsages on missing input", async () => {
    render(
      <Router>
        <HelpRequestForm />
      </Router>,
    );
    await screen.findByTestId("HelpRequestForm-submit");
    await screen.findByTestId(/HelpRequestForm-requesterEmail/);
    const submitButton = screen.getByTestId("HelpRequestForm-submit");

    fireEvent.click(submitButton);

    await screen.findByText(/Requester Email is required./);
    expect(screen.getByText(/Team Id is required./)).toBeInTheDocument();
    expect(
      screen.getByText(/Table or Breakout Room is required/),
    ).toBeInTheDocument();
    expect(screen.getByText(/Request Time is required/)).toBeInTheDocument();
    expect(screen.getByText(/Explanation is required/)).toBeInTheDocument();
  });

  test("No Error messsages on good input", async () => {
    const mockSubmitAction = vi.fn();

    render(
      <Router>
        <HelpRequestForm submitAction={mockSubmitAction} />
      </Router>,
    );
    await screen.findByTestId("HelpRequestForm-submit");

    const requesterEmailField = screen.getByTestId(
      "HelpRequestForm-requesterEmail",
    );
    const teamIdField = screen.getByTestId("HelpRequestForm-teamId");
    const tableOrBreakoutRoomField = screen.getByTestId(
      "HelpRequestForm-tableOrBreakoutRoom",
    );
    const requestTimeField = screen.getByTestId("HelpRequestForm-requestTime");
    const explanationField = screen.getByTestId("HelpRequestForm-explanation");
    const submitButton = screen.getByTestId("HelpRequestForm-submit");

    fireEvent.change(requesterEmailField, {
      target: { value: "whamabe@ucsb.edu" },
    });
    fireEvent.change(teamIdField, { target: { value: "team07" } });
    fireEvent.change(tableOrBreakoutRoomField, { target: { value: "table" } });
    fireEvent.change(requestTimeField, {
      target: { value: "2026-05-03T10:30:30" },
    });
    fireEvent.change(explanationField, {
      target: { value: "I am confused about blah blah blah" },
    });
    fireEvent.click(submitButton);

    await waitFor(() => expect(mockSubmitAction).toHaveBeenCalled());

    expect(
      screen.queryByText(/Requester Email is required./),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/Team Id is required./)).not.toBeInTheDocument();
    expect(
      screen.queryByText(/Table or Breakout Room is required/),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/Request Time is required/),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/Explanation is required/),
    ).not.toBeInTheDocument();
  });

  test("that navigate(-1) is called when Cancel is clicked", async () => {
    render(
      <Router>
        <HelpRequestForm />
      </Router>,
    );
    await screen.findByTestId("HelpRequestForm-cancel");
    const cancelButton = screen.getByTestId("HelpRequestForm-cancel");

    fireEvent.click(cancelButton);

    await waitFor(() => expect(mockedNavigate).toHaveBeenCalledWith(-1));
  });

  //------------------------------

  test("renders default Create button label", () => {
    render(
      <Router>
        <HelpRequestForm submitAction={vi.fn()} />
      </Router>,
    );

    expect(screen.getByTestId("HelpRequestForm-submit")).toHaveTextContent(
      "Create",
    );
  });

  test("does not show id field when initialContents is not provided", () => {
    render(
      <Router>
        <HelpRequestForm submitAction={vi.fn()} />
      </Router>,
    );

    expect(screen.queryByTestId("HelpRequestForm-id")).not.toBeInTheDocument();
  });

  // kinda sketch
  test("shows id field when initialContents is provided", () => {
    const initialContents = {
      id: 17,
      requesterEmail: "student@example.com",
      teamId: "team01",
      tableOrBreakoutRoom: "table 3",
      requestTime: "2025-01-02T03:04:05",
      explanation: "Need help",
      solved: false,
    };

    render(
      <Router>
        <HelpRequestForm
          initialContents={initialContents}
          submitAction={vi.fn()}
        />
      </Router>,
    );

    expect(screen.getByTestId("HelpRequestForm-id")).toBeInTheDocument();
  });

  test("shows disabled id field with correct value when editing", () => {
    const initialContents = {
      id: 17,
      requesterEmail: "student@example.com",
      teamId: "team01",
      tableOrBreakoutRoom: "table 3",
      requestTime: "2025-01-02T03:04:05",
      explanation: "Need help",
      solved: false,
    };

    render(
      <Router>
        <HelpRequestForm
          initialContents={initialContents}
          submitAction={vi.fn()}
        />
      </Router>,
    );

    const idField = screen.getByTestId("HelpRequestForm-id");

    expect(idField).toBeInTheDocument();
    expect(idField).toHaveValue("17");
    expect(idField).toBeDisabled();
  });
});
