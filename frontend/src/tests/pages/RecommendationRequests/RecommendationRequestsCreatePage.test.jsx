import { render, waitFor, fireEvent, screen } from "@testing-library/react";
import RecommendationRequestsCreatePage from "main/pages/RecommendationRequests/RecommendationRequestsCreatePage";
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

describe("RecommendationRequestsCreatePage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);

  beforeEach(() => {
    axiosMock.reset();
    axiosMock.resetHistory();
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  });

  test("renders without crashing", async () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <RecommendationRequestsCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByTestId("RecommendationRequestForm-requesterEmail"),
      ).toBeInTheDocument();
    });
  });

  test("when you fill in the form and hit submit, it makes a request to the backend", async () => {
    const queryClient = new QueryClient();
    const recommendationRequest = {
      id: 17,
      requesterEmail: "ppop@ucsb.edu",
      professorEmail: "bbob@ucsb.edu",
      explanation: "HELP MEE",
      dateRequested: "2022-01-02T12:00:00",
      dateNeeded: "2023-01-02T12:00:01",
      done: true,
    };

    axiosMock
      .onPost("/api/recommendationrequests/post")
      .reply(202, recommendationRequest);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <RecommendationRequestsCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByTestId("RecommendationRequestForm-requesterEmail"),
      ).toBeInTheDocument();
    });

    const requesterEmailField = screen.getByTestId(
      "RecommendationRequestForm-requesterEmail",
    );
    const professorEmailField = screen.getByTestId(
      "RecommendationRequestForm-professorEmail",
    );
    const explanationField = screen.getByTestId(
      "RecommendationRequestForm-explanation",
    );
    const dateRequestedField = screen.getByTestId(
      "RecommendationRequestForm-dateRequested",
    );
    const dateNeededField = screen.getByTestId(
      "RecommendationRequestForm-dateNeeded",
    );
    const doneField = screen.getByTestId("RecommendationRequestForm-done");
    const submitButton = screen.getByTestId("RecommendationRequestForm-submit");

    fireEvent.change(requesterEmailField, { target: { value: "wer@uni.com" } });
    fireEvent.change(professorEmailField, { target: { value: "abo@cob.org" } });
    fireEvent.change(explanationField, { target: { value: "Salutations" } });
    fireEvent.change(dateRequestedField, {
      target: { value: "2072-02-02T00:00" },
    });
    fireEvent.change(dateNeededField, {
      target: { value: "2073-02-02T00:00" },
    });
    fireEvent.click(doneField);

    expect(submitButton).toBeInTheDocument();

    fireEvent.click(submitButton);

    await waitFor(() => expect(axiosMock.history.post.length).toBe(1));

    expect(axiosMock.history.post[0].params).toEqual({
      requesterEmail: "wer@uni.com",
      professorEmail: "abo@cob.org",
      explanation: "Salutations",
      dateRequested: "2072-02-02T00:00",
      dateNeeded: "2073-02-02T00:00",
      done: false,
    });

    expect(mockToast).toBeCalledWith(
      "New recommendationRequest Created - id: 17 explanation: HELP MEE", // initial, not after edit
    );
    expect(mockNavigate).toBeCalledWith({ to: "/recommendationrequests" });
  });
});
