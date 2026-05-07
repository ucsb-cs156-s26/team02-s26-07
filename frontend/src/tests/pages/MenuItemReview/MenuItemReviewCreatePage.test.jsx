import { render, waitFor, fireEvent, screen } from "@testing-library/react";
import MenuItemReviewCreatePage from "main/pages/MenuItemReview/MenuItemReviewCreatePage";
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

describe("MenuItemReviewCreatePage tests", () => {
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
          <MenuItemReviewCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByTestId("MenuItemReviewForm-dateReviewed"),
      ).toBeInTheDocument();
    });
  });

  test("when you fill in the form and hit submit, it makes a request to the backend", async () => {
    const queryClient = new QueryClient();
    const menuItemReview = {
      id: 1,
      itemId: 1,
      reviewerEmail: "1@1.com",
      stars: 1,
      dateReviewed: "1111-11-11T11:11",
      comments: "a",
    };

    axiosMock.onPost("/api/menuitemreview/post").reply(202, menuItemReview);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <MenuItemReviewCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByTestId("MenuItemReviewForm-dateReviewed"),
      ).toBeInTheDocument();
    });

    const itemId = screen.getByTestId("MenuItemReviewForm-itemId");
    const reviewerEmail = screen.getByTestId(
      "MenuItemReviewForm-reviewerEmail",
    );
    const stars = screen.getByTestId("MenuItemReviewForm-stars");
    const dateReviewed = screen.getByTestId("MenuItemReviewForm-dateReviewed");
    const comments = screen.getByTestId("MenuItemReviewForm-comments");
    const submitButton = screen.getByTestId("MenuItemReviewForm-submit");

    fireEvent.change(itemId, { target: { value: 1 } });
    fireEvent.change(reviewerEmail, { target: { value: "1@1.com" } });
    fireEvent.change(stars, { target: { value: 1 } });
    fireEvent.change(dateReviewed, {
      target: { value: "1111-11-11T11:11" },
    });
    fireEvent.change(comments, { target: { value: "a" } });

    expect(submitButton).toBeInTheDocument();

    fireEvent.click(submitButton);

    await waitFor(() => expect(axiosMock.history.post.length).toBe(1));

    expect(axiosMock.history.post[0].params).toEqual({
      itemId: 1,
      reviewerEmail: "1@1.com",
      stars: 1,
      dateReviewed: "1111-11-11T11:11",
      comments: "a",
    });

    expect(mockToast).toBeCalledWith(
      "New menuItemReview Created - id: 1 itemId: 1",
    );
    expect(mockNavigate).toBeCalledWith({ to: "/menuitemreview" });
  });
});
