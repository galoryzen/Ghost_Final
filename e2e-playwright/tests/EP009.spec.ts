import { test, expect } from "@playwright/test";
import { takeScreenshot, VRTBeforeAll } from "../util/util";
import { LoginPage } from "../page/LoginPage";
import { MembersPage } from "../page/MembersPage";
import { faker } from "@faker-js/faker";
import { VISUAL_REGRESSION_TESTING } from "../../shared/config";

// test.beforeAll(VRTBeforeAll);
if (VISUAL_REGRESSION_TESTING) {
    faker.seed(4);
}
test("EP009 Create member with invalid email", async ({
    page,
}, testInfo) => {
    const loginPage = new LoginPage(page, testInfo);
    const membersPage = new MembersPage(page, testInfo);

    // Given: I have logged in
    await loginPage.open();
    await loginPage.login();
    await membersPage.open();

    const fakeValues = {
        name: faker.person.firstName(),
        email: 'invalid-email',
        notes: faker.lorem.sentence(),
    }
    // When: I create a memeber with invalid email
    await membersPage.createMember(fakeValues.name, fakeValues.email, fakeValues.notes);
    await takeScreenshot(page, testInfo, 'Member Not Created');

    // Then: The member is not created
    expect(await membersPage.creationStatus()).toBeFalsy();
});
