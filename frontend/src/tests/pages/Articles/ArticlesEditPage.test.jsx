import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import ArticlesEditPage from "main/pages/Articles/ArticlesEditPage";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

import mockConsole from "tests/testutils/mockConsole";
import { beforeEach, afterEach, expect } from "vitest";

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
    useParams: vi.fn(() => ({
      id: 17,
    })),
    Navigate: vi.fn((x) => {
      mockNavigate(x);
      return null;
    }),
  };
});

let axiosMock;
describe("ArticlesEditPage tests", () => {
  describe("when the backend doesn't return data", () => {
    beforeEach(() => {
      axiosMock = new AxiosMockAdapter(axios);
      axiosMock
        .onGet("/api/currentUser")
        .reply(200, apiCurrentUserFixtures.userOnly);
      axiosMock
        .onGet("/api/systemInfo")
        .reply(200, systemInfoFixtures.showingNeither);
      axiosMock.onGet("/api/articles", { params: { id: 17 } }).timeout();
    });

    afterEach(() => {
      mockToast.mockClear();
      mockNavigate.mockClear();
      axiosMock.restore();
      axiosMock.resetHistory();
    });

    const queryClient = new QueryClient();
    test("renders header but table is not present", async () => {
      const restoreConsole = mockConsole();

      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <ArticlesEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByText(/Welcome/);
      await screen.findByText("Edit Article");
      expect(
        screen.queryByTestId("ArticlesForm-dateAdded"),
      ).not.toBeInTheDocument();
      restoreConsole();
    });
  });

  describe("tests where backend is working normally", () => {
    beforeEach(() => {
      axiosMock = new AxiosMockAdapter(axios);
      axiosMock.reset();
      axiosMock.resetHistory();
      axiosMock
        .onGet("/api/currentUser")
        .reply(200, apiCurrentUserFixtures.userOnly);
      axiosMock
        .onGet("/api/systemInfo")
        .reply(200, systemInfoFixtures.showingNeither);
      axiosMock.onGet("/api/articles", { params: { id: 17 } }).reply(200, {
        id: 17,
        title: "atitle",
        url: "http://article.com",
        explanation: "a sample article",
        email: "email@email.com",
        dateAdded: "2022-02-02T00:00",
      });
      axiosMock.onPut("/api/articles").reply(200, {
        id: "17",
        title: "title2",
        url: "http://article.com2",
        explanation: "a sample article2",
        email: "email2@email.com",
        dateAdded: "2023-02-02T00:00",
      });
    });

    afterEach(() => {
      mockToast.mockClear();
      mockNavigate.mockClear();
      axiosMock.restore();
      axiosMock.resetHistory();
    });

    const queryClient = new QueryClient();
    test("renders without crashing", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <ArticlesEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );
      await screen.findByText(/Welcome/);
      await screen.findByTestId("ArticleForm-dateAdded");
      expect(
        screen.getByTestId("ArticleForm-dateAdded"),
      ).toBeInTheDocument();
    });

    test("Is populated with the data provided", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <ArticlesEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByTestId("ArticleForm-dateAdded");

      const idField = screen.getByTestId("ArticleForm-id");
      const titlef = screen.getByTestId("ArticleForm-title");
      const urlf = screen.getByTestId("ArticleForm-url");
      const explanationf = screen.getByTestId("ArticleForm-explanation");
      const emailf = screen.getByTestId("ArticleForm-email");
      const dateAddedf = screen.getByTestId("ArticleForm-dateAdded");
      const submitButton = screen.getByTestId("ArticleForm-submit");

      expect(idField).toHaveValue("17");
      expect(titlef).toHaveValue("atitle");
      expect(urlf).toHaveValue("http://article.com");
      expect(explanationf).toHaveValue("a sample article");
      expect(emailf).toHaveValue("email@email.com");
      expect(dateAddedf).toHaveValue("2022-02-02T00:00");
      expect(submitButton).toBeInTheDocument();
    });

    test("Changes when you click Update", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <ArticlesEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByTestId("ArticleForm-dateAdded");

      const idField = screen.getByTestId("ArticleForm-id");
      const titlef = screen.getByTestId("ArticleForm-title");
      const urlf = screen.getByTestId("ArticleForm-url");
      const explanationf = screen.getByTestId("ArticleForm-explanation");
      const emailf = screen.getByTestId("ArticleForm-email");
      const dateAddedf = screen.getByTestId("ArticleForm-dateAdded");
      const submitButton = screen.getByTestId("ArticleForm-submit");

      expect(idField).toHaveValue("17");
      expect(titlef).toHaveValue("atitle");
      expect(urlf).toHaveValue("http://article.com");
      expect(explanationf).toHaveValue("a sample article");
      expect(emailf).toHaveValue("email@email.com");
      expect(dateAddedf).toHaveValue("2022-02-02T00:00");
      expect(submitButton).toBeInTheDocument();

      expect(submitButton).toBeInTheDocument();

      fireEvent.change(titlef, { target: { value: "title2" } });
      fireEvent.change(urlf, { target: { value: "http://first.articles.com" } });
      fireEvent.change(explanationf, { target: { value: "explanation" } });
      fireEvent.change(emailf, { target: { value: "anotheremail@email.com" } });
      fireEvent.change(dateAddedf, {target: { value: "2022-12-25T08:00" }, });

      fireEvent.click(submitButton);

      await waitFor(() => expect(mockToast).toBeCalled());
      expect(mockToast).toBeCalledWith(
        "Article Updated - id: 17 title: title2",
      );
      expect(mockNavigate).toBeCalledWith({ to: "/articles" });

      expect(axiosMock.history.put.length).toBe(1); // times called
      expect(axiosMock.history.put[0].params).toEqual({ id: 17 });
      expect(axiosMock.history.put[0].data).toBe(
        JSON.stringify({
          title: "title2",
          url: "http://first.articles.com",
          explanation: "explanation",
          email: "anotheremail@email.com",
          dateAdded: "2022-12-25T08:00",
        }),
      ); // posted object
    });
  });
});
