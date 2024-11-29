import test, { expect } from "@playwright/test";
import { LoginPage } from "../page/LoginPage";
import { TagPage } from "../page/TagPage";
import { takeScreenshot } from "../util/util";
import { faker } from "@faker-js/faker";


/*
    Test Case: EP018 - Tag description should be less than 500 characters
*/
test("EP018 - Verify tag description limit", async ({
    page
}, testInfo) => {
    const loginPage = new LoginPage(page);
    const tagPage = new TagPage(page);
    const tagName = faker.lorem.word();
    const tagDescription = faker.string.alpha({ length: 501 });

    // Given: User is logged in
    await loginPage.open();
    await loginPage.login();
    await takeScreenshot(page, testInfo, "Login");

    // And Navigate to create tag page
    await tagPage.open();
    await takeScreenshot(page, testInfo, "Tag Page");

    // When: I fill the tag description with more than 500 characters
    await tagPage.fillTagName(tagName);
    await tagPage.fillTagDescription(tagDescription);
    // And I save the tag
    await tagPage.saveTag();
    await takeScreenshot(page, testInfo, "Tag Create Error");
    // Then It should show an error
    const error = await tagPage.getSaveFailure();
    expect(await error.isVisible()).toBeTruthy();
    expect(await error.innerText()).toBe('Retry');
});