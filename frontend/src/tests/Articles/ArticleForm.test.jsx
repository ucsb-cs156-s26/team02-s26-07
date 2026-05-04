import { render, waitFor, fireEvent, screen } from "@testing-library/react";
import ArticleForm from "main/components/Articles/ArticleForm";
import { ArticlesFixtures } from "fixtures/articlesFixtures";
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

describe("ArticleForm tests", () => {
  test("renders correctly", async () => {
    render(
      <Router>
        <ArticleForm />
      </Router>,
    );
    await screen.findByText(/Title/);
    await screen.findByText(/Create/);
    expect(screen.getByText(/Title/)).toBeInTheDocument();
  });

  test("renders correctly when passing in a Article", async () => {
    render(
      <Router>
        <ArticleForm initialContents={ArticlesFixtures.oneArticle} />
      </Router>,
    );
    await screen.findByTestId(/ArticleForm-id/);
    expect(screen.getByText(/Id/)).toBeInTheDocument();
    expect(screen.getByTestId(/ArticleForm-id/)).toHaveValue("1");
  });

  test("Correct Error messsages on bad input", async () => {
    render(
      <Router>
        <ArticleForm />
      </Router>,
    );
    await screen.findByTestId("ArticleForm-dateAdded");
    const dateAdded = screen.getByTestId("ArticleForm-dateAdded");
    const submitButton = screen.getByTestId("ArticleForm-submit");

    fireEvent.change(dateAdded, { target: { value: "bad-input" } });
    fireEvent.click(submitButton);

    await screen.findByText(/dateAdded is required/);
    expect(screen.getByText(/dateAdded is required/)).toBeInTheDocument();
  });

  test("Correct Error messsages on missing input", async () => {
    render(
      <Router>
        <ArticleForm />
      </Router>,
    );
    await screen.findByTestId("ArticleForm-submit");
    const submitButton = screen.getByTestId("ArticleForm-submit");

    fireEvent.click(submitButton);

    await screen.findByText(/title is required./);
    expect(screen.getByText(/email is required./)).toBeInTheDocument();
    expect(screen.getByText(/dateAdded is required./)).toBeInTheDocument();
    expect(screen.getByText(/explanation is required./)).toBeInTheDocument();
    expect(screen.getByText(/url is required./)).toBeInTheDocument();
  });

  test("No Error messsages on good input", async () => {
    const mockSubmitAction = vi.fn();

    render(
      <Router>
        <ArticleForm submitAction={mockSubmitAction} />
      </Router>,
    );
    await screen.findByTestId("ArticleForm-dateAdded");

    const dateAdded = screen.getByTestId("ArticleForm-dateAdded");
    const title = screen.getByTestId("ArticleForm-title");
    const email = screen.getByTestId("ArticleForm-email");
    const url = screen.getByTestId("ArticleForm-url");
    const explanation = screen.getByTestId("ArticleForm-explanation");
    const submitButton = screen.getByTestId("ArticleForm-submit");

    fireEvent.change(email, { target: { value: "testemail@tst.com" } });
    fireEvent.change(title, { target: { value: "atitle" } });
    fireEvent.change(url, { target: { value: "http://testurl.com" } });
    fireEvent.change(explanation, { target: { value: "noon on January 2nd" } });
    fireEvent.change(dateAdded, {
      target: { value: "2022-01-02T12:00" },
    });
    fireEvent.click(submitButton);

    await waitFor(() => expect(mockSubmitAction).toHaveBeenCalled());

    expect(
      screen.queryByText(/dateAdded must be in ISO format/),
    ).not.toBeInTheDocument();
  });

  test("that navigate(-1) is called when Cancel is clicked", async () => {
    render(
      <Router>
        <ArticleForm />
      </Router>,
    );
    await screen.findByTestId("ArticleForm-cancel");
    const cancelButton = screen.getByTestId("ArticleForm-cancel");

    fireEvent.click(cancelButton);

    await waitFor(() => expect(mockedNavigate).toHaveBeenCalledWith(-1));
  });
});
