package edu.ucsb.cs156.example.web;

import static com.microsoft.playwright.assertions.PlaywrightAssertions.assertThat;

import edu.ucsb.cs156.example.WebTestCase;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.annotation.DirtiesContext.ClassMode;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;

@ExtendWith(SpringExtension.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.DEFINED_PORT)
@ActiveProfiles("integration")
@DirtiesContext(classMode = ClassMode.BEFORE_EACH_TEST_METHOD)
public class RecommendationRequestWebIT extends WebTestCase {
  @Test
  public void admin_user_can_create_edit_delete_recommendationrequest() throws Exception {
    setupUser(true);

    page.getByText("Recommendation Requests").click();

    page.getByText("Create RecommendationRequest").click();
    assertThat(page.getByText("Create New RecommendationRequest")).isVisible();
    page.getByTestId("RecommendationRequestForm-requesterEmail").fill("plor@ucsb.edu");
    page.getByTestId("RecommendationRequestForm-professorEmail").fill("bolr@ucsb.edu");
    page.getByTestId("RecommendationRequestForm-explanation").fill("Help build THE burrito chain");
    page.getByTestId("RecommendationRequestForm-dateRequested").fill("2022-12-12T12:12:12");
    page.getByTestId("RecommendationRequestForm-dateNeeded").fill("2022-12-12T12:12:12");
    page.getByTestId("RecommendationRequestForm-done").click(); // checkbox, cannot use fill
    page.getByTestId("RecommendationRequestForm-submit").click();

    assertThat(page.getByTestId("RecommendationRequestsTable-cell-row-0-col-requesterEmail"))
        .hasText("plor@ucsb.edu");

    page.getByTestId("RecommendationRequestsTable-cell-row-0-col-Edit-button").click();
    assertThat(page.getByText("Edit RecommendationRequest")).isVisible();
    page.getByTestId("RecommendationRequestForm-requesterEmail").fill("plob@ucsb.edu");
    page.getByTestId("RecommendationRequestForm-submit").click();

    assertThat(page.getByTestId("RecommendationRequestsTable-cell-row-0-col-requesterEmail"))
        .hasText("plob@ucsb.edu");

    page.getByTestId("RecommendationRequestsTable-cell-row-0-col-Delete-button").click();

    assertThat(page.getByTestId("RecommendationRequestsTable-cell-row-0-col-explanation"))
        .not()
        .isVisible();
  }

  @Test
  public void regular_user_cannot_create_recommendationrequest() throws Exception {
    setupUser(false);

    page.getByText("Recommendation Requests").click();

    assertThat(page.getByText("Create RecommendationRequest")).not().isVisible();
    assertThat(page.getByTestId("RecommendationRequestsTable-cell-row-0-col-explanation"))
        .not()
        .isVisible();
  }
}
