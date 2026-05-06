import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import UCSBDiningCommonsMenuItemCreatePage from "main/pages/UCSBDiningCommonsMenuItem/UCSBDiningCommonsMenuItemCreatePage";
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

describe("UCSBDiningCommonsMenuItemCreatePage tests", () => {
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
          <UCSBDiningCommonsMenuItemCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByTestId("UCSBDiningCommonsMenuItemForm-diningCommonsCode"),
      ).toBeInTheDocument();
    });
  });

  test("on submit, makes request to backend, and redirects to /diningcommonsmenuitem", async () => {
    const queryClient = new QueryClient();
    const ucsbDiningCommonsMenuItem = {
      id: 3,
      diningCommonsCode: "ortega",
      name: "Baked Pesto Pasta with Chicken",
      station: "Entrees",
    };

    axiosMock
      .onPost("/api/ucsbdiningcommonsmenuitem/post")
      .reply(202, ucsbDiningCommonsMenuItem);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <UCSBDiningCommonsMenuItemCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByTestId("UCSBDiningCommonsMenuItemForm-diningCommonsCode"),
      ).toBeInTheDocument();
    });

    const diningCommonsCodeInput = screen.getByTestId(
      "UCSBDiningCommonsMenuItemForm-diningCommonsCode",
    );
    const nameInput = screen.getByTestId("UCSBDiningCommonsMenuItemForm-name");
    const stationInput = screen.getByTestId(
      "UCSBDiningCommonsMenuItemForm-station",
    );
    const submitButton = screen.getByTestId(
      "UCSBDiningCommonsMenuItemForm-submit",
    );

    fireEvent.change(diningCommonsCodeInput, { target: { value: "ortega" } });
    fireEvent.change(nameInput, {
      target: { value: "Baked Pesto Pasta with Chicken" },
    });
    fireEvent.change(stationInput, { target: { value: "Entrees" } });
    fireEvent.click(submitButton);

    await waitFor(() => expect(axiosMock.history.post.length).toBe(1));

    expect(axiosMock.history.post[0].params).toEqual({
      diningCommonsCode: "ortega",
      name: "Baked Pesto Pasta with Chicken",
      station: "Entrees",
    });

    expect(mockToast).toBeCalledWith(
      "New UCSBDiningCommonsMenuItem Created - id: 3 name: Baked Pesto Pasta with Chicken",
    );
    expect(mockNavigate).toBeCalledWith({ to: "/diningcommonsmenuitem" });
  });
});
