import { test, expect } from "@playwright/test";
import { takeScreenshot, VRTBeforeAll } from "../util/util";
import { LoginPage } from "../page/LoginPage";
import { MembersPage } from "../page/MembersPage";
import { faker } from "@faker-js/faker";
import { VISUAL_REGRESSION_TESTING } from "../../shared/config";

// test.beforeAll(VRTBeforeAll);
if (VISUAL_REGRESSION_TESTING) {
    faker.seed(3);
}
test("EP008 Create member without name", async ({
    page,
}, testInfo) => {
    const loginPage = new LoginPage(page, testInfo);
    const membersPage = new MembersPage(page, testInfo);

    // Given: I have logged
    await loginPage.open();
    await loginPage.login();
    await membersPage.open();

    const fakeValues = {
        email: faker.internet.email(),
        notes: faker.lorem.sentence(),
    }
    // When: I create a memeber with no name
    await membersPage.createMember('', fakeValues.email, fakeValues.notes);
    await takeScreenshot(page, testInfo, 'Member Created');

    // Then: The member is created successfully
    await membersPage.open();
    // Member has email as name
    await expect(membersPage.containsName(fakeValues.email)).toHaveCount(1);
});
