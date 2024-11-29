import test, { expect } from "@playwright/test";
import { LoginPage } from "../page/LoginPage";
import { TagPage } from "../page/TagPage";
import { takeScreenshot } from "../util/util";
import { faker } from "@faker-js/faker";

/*
    Test Case: EP019 - Verify tag slug should be less than 191 characters
*/
test("EP019 - Verify tag slug limit", async ({
    page
}, testInfo) => {
    const loginPage = new LoginPage(page);
    const tagPage = new TagPage(page);
    const tagName = faker.lorem.word();
    const tagDescription = faker.lorem.sentence();
    const tagSlug = faker.string.alpha({ length: 192 });


    // Given: User is logged in
    await loginPage.open();
    await loginPage.login();
    await takeScreenshot(page, testInfo, "Login");

    // And Navigate to create tag page
    await tagPage.open();
    await takeScreenshot(page, testInfo, "Tag Page");
    // When: I fill the tag slug with more than 191 characters
    await tagPage.fillTagName(tagName);
    await tagPage.fillTagDescription(tagDescription);
    await tagPage.fillTagSlug(tagSlug);
    // And I save the tag
    await tagPage.saveTag();
    // Then It should show an error
    await takeScreenshot(page, testInfo, "Tag Saved");
    const error = await tagPage.getSaveFailure();
    expect(await error.isVisible()).toBeTruthy();
    expect(await error.innerText()).toBe('Retry');
});