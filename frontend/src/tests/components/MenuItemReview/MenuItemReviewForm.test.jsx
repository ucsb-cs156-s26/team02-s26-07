import { render, waitFor, fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MenuItemReviewForm from "main/components/MenuItemReview/MenuItemReviewForm";
import { menuItemReviewFixtures } from "fixtures/menuItemReviewFixtures";
import { BrowserRouter as Router } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const mockedNavigate = vi.fn();
vi.mock("react-router", async () => {
  const originalModule = await vi.importActual("react-router");
  return {
    ...originalModule,
    useNavigate: () => mockedNavigate,
  };
});

describe("MenuItemReviewForm tests", () => {
  const queryClient = new QueryClient();
  const testId = "MenuItemReviewForm";

  test("renders correctly with no initialContents", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <MenuItemReviewForm />
        </Router>
      </QueryClientProvider>,
    );
    expect(await screen.findByText(/Create/)).toBeInTheDocument();
    expect(screen.getByText(/Item Id/)).toBeInTheDocument();
    expect(screen.getByText(/Reviewer Email/)).toBeInTheDocument();
    expect(screen.getByText(/Stars/)).toBeInTheDocument();
    expect(screen.getByText(/Date Reviewed/)).toBeInTheDocument();
    expect(screen.getByText(/Comments/)).toBeInTheDocument();
  });

  test("renders correctly when passing in initialContents", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <MenuItemReviewForm
            initialContents={menuItemReviewFixtures.oneMenuItemReview[0]}
          />
        </Router>
      </QueryClientProvider>,
    );
    expect(await screen.findByTestId(`${testId}-id`)).toBeInTheDocument();
    expect(screen.getByText("Id")).toBeInTheDocument();
    expect(screen.getByTestId(`${testId}-id`)).toHaveValue("1");
  });

  test("that navigate(-1) is called when Cancel is clicked", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <MenuItemReviewForm />
        </Router>
      </QueryClientProvider>,
    );
    expect(await screen.findByTestId(`${testId}-cancel`)).toBeInTheDocument();
    const cancelButton = screen.getByTestId(`${testId}-cancel`);
    fireEvent.click(cancelButton);
    await waitFor(() => expect(mockedNavigate).toHaveBeenCalledWith(-1));
  });

  test("Correct error messages on missing input", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <MenuItemReviewForm />
        </Router>
      </QueryClientProvider>,
    );
    await screen.findByTestId(`${testId}-submit`);
    const submitButton = screen.getByTestId(`${testId}-submit`);

    fireEvent.click(submitButton);

    await screen.findByText(/Item Id is required./);
    expect(screen.getByText(/Reviewer Email is required./)).toBeInTheDocument();
    expect(screen.getByText(/Stars is required./)).toBeInTheDocument();
    expect(screen.getByText(/Date Reviewed is required./)).toBeInTheDocument();
    expect(screen.getByText(/Comments is required./)).toBeInTheDocument();
  });

  test("Correct error messages on bad input", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <MenuItemReviewForm />
        </Router>
      </QueryClientProvider>,
    );
    await screen.findByTestId(`${testId}-stars`);
    const starsField = screen.getByTestId(`${testId}-stars`);
    const submitButton = screen.getByTestId(`${testId}-submit`);

    fireEvent.change(starsField, { target: { value: "6" } });
    fireEvent.click(submitButton);

    await screen.findByText(/Stars must be at most 5./);
    expect(screen.getByText(/Stars must be at most 5./)).toBeInTheDocument();

    fireEvent.change(starsField, { target: { value: "0" } });
    fireEvent.click(submitButton);

    await screen.findByText(/Stars must be at least 1./);
    expect(screen.getByText(/Stars must be at least 1./)).toBeInTheDocument();
  });

  test("No error messages on good input", async () => {
    const mockSubmitAction = vi.fn();
    const user = userEvent.setup();

    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <MenuItemReviewForm submitAction={mockSubmitAction} />
        </Router>
      </QueryClientProvider>,
    );
    await screen.findByTestId(`${testId}-itemId`);

    fireEvent.change(screen.getByTestId(`${testId}-dateReviewed`), {
      target: { value: "2026-05-20T12:00" },
    });
    await user.type(screen.getByTestId(`${testId}-itemId`), "3");
    await user.type(
      screen.getByTestId(`${testId}-reviewerEmail`),
      "no@ucsb.edu",
    );
    await user.type(screen.getByTestId(`${testId}-stars`), "1");
    await user.type(
      screen.getByTestId(`${testId}-comments`),
      "tide pod cake sucks",
    );

    await user.click(screen.getByTestId(`${testId}-submit`));

    await waitFor(() => expect(mockSubmitAction).toHaveBeenCalled());

    expect(mockSubmitAction).toHaveBeenCalledWith(
      expect.objectContaining({
        itemId: 3,
        stars: 1,
      }),
      expect.anything(),
    );

    expect(screen.queryByText(/Item Id is required./)).not.toBeInTheDocument();
    expect(
      screen.queryByText(/Reviewer Email is required./),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/Stars is required./)).not.toBeInTheDocument();
    expect(
      screen.queryByText(/Date Reviewed is required./),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/Comments is required./)).not.toBeInTheDocument();
  });
});
