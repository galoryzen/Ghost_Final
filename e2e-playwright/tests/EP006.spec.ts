import { test, expect } from "@playwright/test";
import { takeScreenshot, VRTBeforeAll } from "../util/util";
import { LoginPage } from "../page/LoginPage";
import { MembersPage } from "../page/MembersPage";
import { faker } from "@faker-js/faker";
import { VISUAL_REGRESSION_TESTING } from "../../shared/config";

// test.beforeAll(VRTBeforeAll);
if (VISUAL_REGRESSION_TESTING) {
    faker.seed(1);
}
test("EP006 Create member", async ({
    page,
}, testInfo) => {
    const loginPage = new LoginPage(page, testInfo);
    const membersPage = new MembersPage(page, testInfo);

    // Given: I have logged in
    await loginPage.open();
    await loginPage.login();
    await membersPage.open();


    // When: I create a member
    const fakeValues = {
        name: faker.person.firstName(),
        email: faker.internet.email(),
        notes: faker.lorem.sentence(),
    }
    await membersPage.createMember(fakeValues.name, fakeValues.email, fakeValues.notes);
    await takeScreenshot(page, testInfo, 'Member Created');

    // Then: Navigate back to the membersPage and verify the member is created
    await membersPage.open();
    await page.waitForLoadState('networkidle');
    await takeScreenshot(page, testInfo, 'Members Page');
    await expect(membersPage.containsName(fakeValues.name)).toHaveCount(1);
});
