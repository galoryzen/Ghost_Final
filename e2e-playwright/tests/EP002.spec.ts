import { test, expect } from "@playwright/test";
import { LoginPage } from "../page/LoginPage";
import { faker } from "@faker-js/faker";
import { CreatePagePage } from "../page/CreatePagePage";
import { PageListPage } from "../page/PageListPage";
import { takeScreenshot } from "../util/util";
import { VISUAL_REGRESSION_TESTING } from "../../shared/config";

test("EP002 Given the no page created, When I create 2 pages, Then the page list should be sorted by creation time", async ({
  page,
}, testInfo) => {
  test.skip(
    VISUAL_REGRESSION_TESTING,
    "Skipping for VRT"
  );

  const loginPage = new LoginPage(page);
  const createPagePage = new CreatePagePage(page);
  const pageListPage = new PageListPage(page);

  // Given: No members exist, and the user is logged in
  await loginPage.open();
  await loginPage.login();
  expect(await loginPage.userIsLoggedIn()).toBeTruthy();

  // And Navigate to the page
  await createPagePage.open();

  // When: I create a Page
  let firstPostTitle = faker.lorem.sentence();
  let firstPostParagraph = faker.lorem.paragraph();

  let fakeValues = {
    name: firstPostTitle,
    paragraph: firstPostParagraph,
  };

  await createPagePage.fillForm(fakeValues.name, fakeValues.paragraph);
  await createPagePage.publishPost();

  await pageListPage.open();

  // When I create a new page after the first one
  await createPagePage.open();

  const secondPostTitle = faker.lorem.sentence();
  const secondPostParagraph = faker.lorem.paragraph();

  fakeValues = {
    name: secondPostTitle,
    paragraph: secondPostParagraph,
  };

  await createPagePage.fillForm(fakeValues.name, fakeValues.paragraph);
  await createPagePage.publishPost();

  await pageListPage.open();

  await page.waitForTimeout(1000);

  const recentPage = await pageListPage.getPageTableRows();

  expect(await recentPage[0].innerText()).toContain(secondPostTitle);
  expect(await recentPage[1].innerText()).toContain(firstPostTitle);
});
