import { render, waitFor, fireEvent, screen } from "@testing-library/react";
import ArticlesCreatePage from "main/pages/Articles/ArticlesCreatePage";
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

describe("ArticleCreatePage tests", () => {
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
          <ArticlesCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("ArticleForm-dateAdded")).toBeInTheDocument();
    });
  });

  test("when you fill in the form and hit submit, it makes a request to the backend", async () => {
    const queryClient = new QueryClient();
    const article = {
      id: 17,
      title: "atitle",
      url: "http://article.com",
      explanation: "a sample article",
      email: "authoremail@email.com",
      dateAdded: "2022-02-02T00:00",
    };

    axiosMock.onPost("/api/articles/post").reply(202, article);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ArticlesCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("ArticleForm-dateAdded")).toBeInTheDocument();
    });

    const dateAdded = screen.getByTestId("ArticleForm-dateAdded");
    const title = screen.getByTestId("ArticleForm-title");
    const url = screen.getByTestId("ArticleForm-url");
    const explanation = screen.getByTestId("ArticleForm-explanation");
    const email = screen.getByTestId("ArticleForm-email");
    const submitButton = screen.getByTestId("ArticleForm-submit");

    fireEvent.change(title, { target: { value: "atitle" } });
    fireEvent.change(url, { target: { value: "http://article.com" } });
    fireEvent.change(explanation, { target: { value: "a sample article" } });
    fireEvent.change(email, { target: { value: "email@email.com" } });
    fireEvent.change(dateAdded, {
      target: { value: "2022-02-02T00:00" },
    });

    expect(submitButton).toBeInTheDocument();

    fireEvent.click(submitButton);

    await waitFor(() => expect(axiosMock.history.post.length).toBe(1));

    expect(axiosMock.history.post[0].params).toEqual({
      title: "atitle",
      url: "http://article.com",
      explanation: "a sample article",
      email: "email@email.com",
      dateAdded: "2022-02-02T00:00",
    });

    expect(mockToast).toBeCalledWith(
      "New Article Created - id: 17 title: atitle",
    );
    expect(mockNavigate).toBeCalledWith({ to: "/articles" });
  });
});
