import { render, waitFor, fireEvent, screen } from "@testing-library/react";
import UCSBOrganizationCreatePage from "main/pages/UCSBOrganization/UCSBOrganizationCreatePage";
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

describe("UCSBOrganizationCreatePage tests", () => {
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
          <UCSBOrganizationCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );
    await waitFor(() => {
      expect(
        screen.getByTestId("UCSBOrganizationForm-orgTranslationShort"),
      ).toBeInTheDocument();
    });
  });

  test("when you fill in the form and hit submit, it makes a request to the backend", async () => {
    const queryClient = new QueryClient();
    const ucsbOrganization = {
      orgCode: "ZPR",
      orgTranslationShort: "ZETA PHI RHO",
      orgTranslation: "ZETA PHI RHO FRATERNITY",
      inactive: false,
    };

    axiosMock
      .onPost("/api/ucsborganizations/post")
      .reply(202, ucsbOrganization);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <UCSBOrganizationCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByTestId("UCSBOrganizationForm-orgTranslationShort"),
      ).toBeInTheDocument();
    });

    const orgTranslationShortField = screen.getByTestId(
      "UCSBOrganizationForm-orgTranslationShort",
    );
    const orgTranslationField = screen.getByTestId(
      "UCSBOrganizationForm-orgTranslation",
    );
    const submitButton = screen.getByTestId("UCSBOrganizationForm-submit");

    fireEvent.change(orgTranslationShortField, {
      target: { value: "ZETA PHI RHO" },
    });
    fireEvent.change(orgTranslationField, {
      target: { value: "ZETA PHI RHO FRATERNITY" },
    });

    expect(submitButton).toBeInTheDocument();
    fireEvent.click(submitButton);

    await waitFor(() => expect(axiosMock.history.post.length).toBe(1));

    expect(axiosMock.history.post[0].params).toEqual({
      orgCode: undefined,
      orgTranslationShort: "ZETA PHI RHO",
      orgTranslation: "ZETA PHI RHO FRATERNITY",
      inactive: false,
    });

    expect(mockToast).toBeCalledWith(
      "New UCSBOrganization Created - orgCode: ZPR orgTranslationShort: ZETA PHI RHO",
    );
    expect(mockNavigate).toBeCalledWith({ to: "/ucsborganizations" });
  });
});
