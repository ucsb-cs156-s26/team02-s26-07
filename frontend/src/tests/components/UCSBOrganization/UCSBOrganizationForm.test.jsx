import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router";

import UCSBOrganizationForm from "main/components/UCSBOrganization/UCSBOrganizationForm";
import { ucsbOrganizationFixtures } from "fixtures/ucsbOrganizationFixtures";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const mockedNavigate = vi.fn();
vi.mock("react-router", async () => {
  const originalModule = await vi.importActual("react-router");
  return {
    ...originalModule,
    useNavigate: () => mockedNavigate,
  };
});

describe("UCSBOrganizationForm tests", () => {
  const queryClient = new QueryClient();

  const expectedHeaders = [
    "Organization Translation Short",
    "Organization Translation",
    "Inactive",
  ];
  const testId = "UCSBOrganizationForm";

  test("renders correctly with no initialContents", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <UCSBOrganizationForm />
        </Router>
      </QueryClientProvider>,
    );

    expect(await screen.findByText(/Create/)).toBeInTheDocument();

    expectedHeaders.forEach((headerText) => {
      const header = screen.getByText(headerText);
      expect(header).toBeInTheDocument();
    });
  });

  test("renders correctly when passing in initialContents", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <UCSBOrganizationForm
            initialContents={ucsbOrganizationFixtures.oneOrganization}
          />
        </Router>
      </QueryClientProvider>,
    );

    expect(await screen.findByText(/Create/)).toBeInTheDocument();

    expectedHeaders.forEach((headerText) => {
      const header = screen.getByText(headerText);
      expect(header).toBeInTheDocument();
    });

    expect(await screen.findByTestId(`${testId}-orgCode`)).toBeInTheDocument();
    expect(screen.getByText(/Org Code/)).toBeInTheDocument();
    expect(screen.getByTestId(`${testId}-orgCode`)).toHaveValue("ZPR");
  });

  test("that navigate(-1) is called when Cancel is clicked", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <UCSBOrganizationForm />
        </Router>
      </QueryClientProvider>,
    );
    expect(await screen.findByTestId(`${testId}-cancel`)).toBeInTheDocument();
    const cancelButton = screen.getByTestId(`${testId}-cancel`);

    fireEvent.click(cancelButton);

    await waitFor(() => expect(mockedNavigate).toHaveBeenCalledWith(-1));
  });

  test("that the correct validations are performed", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <UCSBOrganizationForm />
        </Router>
      </QueryClientProvider>,
    );

    expect(await screen.findByText(/Create/)).toBeInTheDocument();
    const submitButton = screen.getByText(/Create/);
    fireEvent.click(submitButton);

    await screen.findByText(/Organization Translation Short is required./);
    expect(
      screen.getByText(/Organization Translation is required./),
    ).toBeInTheDocument();
  });

  test("No error messages on good input", async () => {
    const mockSubmitAction = vi.fn();

    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <UCSBOrganizationForm submitAction={mockSubmitAction} />
        </Router>
      </QueryClientProvider>,
    );

    const orgTranslationShortField = screen.getByTestId(
      `${testId}-orgTranslationShort`,
    );
    const orgTranslationField = screen.getByTestId(`${testId}-orgTranslation`);
    const submitButton = screen.getByTestId(`${testId}-submit`);

    fireEvent.change(orgTranslationShortField, {
      target: { value: "ZETA PHI RHO" },
    });
    fireEvent.change(orgTranslationField, {
      target: { value: "ZETA PHI RHO FRATERNITY" },
    });
    fireEvent.click(submitButton);

    await waitFor(() => expect(mockSubmitAction).toHaveBeenCalled());

    expect(
      screen.queryByText(/Organization Translation Short is required./),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/Organization Translation is required./),
    ).not.toBeInTheDocument();
  });
});
