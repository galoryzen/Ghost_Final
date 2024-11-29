import { test, expect } from "@playwright/test";
import { takeScreenshot, VRTBeforeAll } from "../util/util";
import { LoginPage } from "../page/LoginPage";
import { MembersPage } from "../page/MembersPage";
import { faker } from "@faker-js/faker";
import { VISUAL_REGRESSION_TESTING } from "../../shared/config";

// test.beforeAll(VRTBeforeAll);
if (VISUAL_REGRESSION_TESTING) {
    faker.seed(5);
}
test("EP010 Edit member", async ({
    page,
}, testInfo) => {
    const loginPage = new LoginPage(page, testInfo);
    const membersPage = new MembersPage(page, testInfo);

    // Given: I have logged in and created a member
    await loginPage.open();
    await loginPage.login();
    await membersPage.open();

    const fakeValues = {
        name1: faker.person.firstName(),
        name2: faker.person.firstName(),
        email1: faker.internet.email(),
        email2: faker.internet.email(),
        notes1: faker.lorem.sentence(),
        notes2: faker.lorem.sentence(),
    }
    await membersPage.createMember(fakeValues.name1, fakeValues.email1, fakeValues.notes1);
    await takeScreenshot(page, testInfo, 'Member Created');

    // Validate creation
    await expect(membersPage.containsName(fakeValues.name1)).toHaveCount(1);
    await expect(membersPage.containsEmail(fakeValues.email1)).toHaveCount(1);
    await expect(membersPage.containsName(fakeValues.name2)).toHaveCount(0);
    await expect(membersPage.containsEmail(fakeValues.email2)).toHaveCount(0);

    // When: I edit the member
    await membersPage.editMember(fakeValues.email1, fakeValues.name2, fakeValues.email2, fakeValues.notes2);
    await takeScreenshot(page, testInfo, 'Member Edited');

    // Then: The member is updated
    await expect(membersPage.containsName(fakeValues.name1)).toHaveCount(0);
    await expect(membersPage.containsEmail(fakeValues.email1)).toHaveCount(0);
    await expect(membersPage.containsName(fakeValues.name2)).toHaveCount(1);
    await expect(membersPage.containsEmail(fakeValues.email2)).toHaveCount(1);
});
