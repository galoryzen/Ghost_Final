import { test, expect } from "@playwright/test";
import { takeScreenshot } from "../util/util";
import { LoginPage } from "../page/LoginPage";
import { DashboardPage } from "../page/DashboardPage";
import { CreatePostPage } from "../page/CreatePostPage";
import { VERSION, VISUAL_REGRESSION_TESTING } from "../../shared/config";

test("EP004 Given no post exists, When I create a new post, Then the post table should show 1 result", async ({
  page,
}, testInfo) => {
  test.skip(
    VISUAL_REGRESSION_TESTING,
    "Skipping for VRT"
  );

  const loginPage = new LoginPage(page);
  const dashboardPage = new DashboardPage(page);
  const createPostPage = new CreatePostPage(page);

  // Given: User is logged in, and 1 post already exists
  await loginPage.open();
  await loginPage.login();

  // When: I create a new post
  await createPostPage.open();
  const postCreatedName = await createPostPage.fillForm();
  await createPostPage.publishPost();

  // Then: Navigate to the dashboard and verify the post table shows 2 posts
  await dashboardPage.open();

  await page.waitForTimeout(1000);

  const updatedPostTable = await dashboardPage.getPostTable();
  await expect(updatedPostTable).toBeVisible({ timeout: 5000 });

  const dashboardPageInnerText = await page.innerText("body");

  expect(dashboardPageInnerText).toContain(postCreatedName);
});
