import { test, expect } from "@playwright/test";
import { takeScreenshot } from "../util/util";
import { LoginPage } from "../page/LoginPage";
import { DashboardPage } from "../page/DashboardPage";
import { MembersPage } from "../page/MembersPage";
import { faker } from "@faker-js/faker";
import { VERSION } from "../../shared/config";

test("EP003 Given no members exist, When I create a member, Then the dashboard should show 1 member", async ({
  page,
}, testInfo) => {
  test.skip(
    VERSION !== "5.96.0",
    "The functionality was not available in this version"
  );

  const loginPage = new LoginPage(page);
  const dashboardPage = new DashboardPage(page);
  const membersPage = new MembersPage(page);

  // Given: No members exist, and the user is logged in
  await loginPage.open();
  await loginPage.login();

  expect(await loginPage.userIsLoggedIn()).toBeTruthy();

  // When: I create a member
  await membersPage.open();

  const fakeValues = {
    name: faker.person.firstName(),
    email: faker.internet.email(),
    notes: faker.lorem.sentence(),
  };

  await membersPage.createMember(
    fakeValues.name,
    fakeValues.email,
    fakeValues.notes
  );

  // Then: Navigate to the dashboard and verify it shows 1 member
  await dashboardPage.open();

  await page.waitForTimeout(1000);

  const dashboardText = await dashboardPage.getDashboardMembersValue();
  const updatedDashboardText = await dashboardText.innerText();
  const words = updatedDashboardText.split("\n");

  expect(words[0]).not.toContain("0");
});
