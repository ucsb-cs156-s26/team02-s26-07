import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import HelpRequestCreatePage from "main/pages/HelpRequest/HelpRequestCreatePage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";

import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

const mockToast = vi.fn();
vi.mock("react-toastify", async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    toast: vi.fn((x) => mockToast(x)),
  };
});

const mockNavigate = vi.fn();
vi.mock("react-router", async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    Navigate: vi.fn((x) => {
      mockNavigate(x);
      return null;
    }),
  };
});

describe("HelpRequestCreatePage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);

  beforeEach(() => {
    vi.clearAllMocks();
    axiosMock.reset();
    axiosMock.resetHistory();
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  });

  const queryClient = new QueryClient();

  test("renders without crashing", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <HelpRequestCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByLabelText("Requester Email")).toBeInTheDocument();
    });
  });

  test("on submit, makes request to backend, and redirects to /helprequest", async () => {
    const queryClient = new QueryClient();
    const helpRequest = {
      id: 2,
      requesterEmail: "whamabe@ucsb.edu",
      teamId: "team07",
      tableOrBreakoutRoom: "table",
      requestTime: "2026-05-03T10:30:30",
      explanation: "I am confused about blah blah blah",
      solved: false,
    };

    axiosMock.onPost("/api/helprequests/post").reply(202, helpRequest);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <HelpRequestCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByLabelText("Requester Email")).toBeInTheDocument();
    });

    const requesterEmailInput = screen.getByLabelText("Requester Email");
    const teamIdInput = screen.getByLabelText("Team Id");
    const tableOrBreakoutRoomInput = screen.getByLabelText(
      "Table or Breakout Room",
    );
    const requestTimeInput = screen.getByLabelText("Request Time");
    const explanationInput = screen.getByLabelText("Explanation");
    const createButton = screen.getByText("Create");

    expect(requesterEmailInput).toBeInTheDocument();
    expect(teamIdInput).toBeInTheDocument();
    expect(tableOrBreakoutRoomInput).toBeInTheDocument();
    expect(requestTimeInput).toBeInTheDocument();
    expect(explanationInput).toBeInTheDocument();
    expect(createButton).toBeInTheDocument();

    fireEvent.change(requesterEmailInput, {
      target: { value: "whamabe@ucsb.edu" },
    });
    fireEvent.change(teamIdInput, { target: { value: "team07" } });
    fireEvent.change(tableOrBreakoutRoomInput, { target: { value: "table" } });
    fireEvent.change(requestTimeInput, {
      target: { value: "2026-05-03T10:30:30" },
    });
    fireEvent.change(explanationInput, {
      target: { value: "I am confused about blah blah blah" },
    });
    fireEvent.click(createButton);

    await waitFor(() => expect(axiosMock.history.post.length).toBe(1));

    expect(axiosMock.history.post[0].params).toEqual({
      requesterEmail: "whamabe@ucsb.edu",
      teamId: "team07",
      tableOrBreakoutRoom: "table",
      requestTime: "2026-05-03T10:30:30.000",
      explanation: "I am confused about blah blah blah",
      solved: false,
    });

    expect(mockToast).toBeCalledWith(
      "New Help Request Created - id: 2 requesterEmail: whamabe@ucsb.edu",
    );
    expect(mockNavigate).toBeCalledWith({ to: "/helprequest" });
  });
});
