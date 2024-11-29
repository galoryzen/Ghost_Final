import { test, expect } from "@playwright/test";
import { takeScreenshot, VRTBeforeAll } from "../util/util";
import { LoginPage } from "../page/LoginPage";
import { MembersPage } from "../page/MembersPage";
import { faker } from "@faker-js/faker";
import { VISUAL_REGRESSION_TESTING } from "../../shared/config";

// test.beforeAll(VRTBeforeAll);
if (VISUAL_REGRESSION_TESTING) {
    faker.seed(6);
}
test("EP011 Edit member with duplicate email", async ({
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
    await membersPage.createMember(fakeValues.name2, fakeValues.email2, fakeValues.notes2);
    await takeScreenshot(page, testInfo, 'Member Created');

    await membersPage.open();

    // Validate creation
    await expect(membersPage.containsName(fakeValues.name1)).toHaveCount(1);
    await expect(membersPage.containsEmail(fakeValues.email1)).toHaveCount(1);
    await expect(membersPage.containsName(fakeValues.name2)).toHaveCount(1);
    await expect(membersPage.containsEmail(fakeValues.email2)).toHaveCount(1);

    // When: I edit the second member with the email of the first member
    await membersPage.editMember(fakeValues.email2, fakeValues.name2, fakeValues.email1, fakeValues.notes2);
    await takeScreenshot(page, testInfo, 'Member Edited Fail');

    // Then: The member is not updated
    expect(await membersPage.creationStatus()).toBeFalsy();
});
