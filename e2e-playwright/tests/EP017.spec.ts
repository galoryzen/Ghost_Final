import test, { expect } from "@playwright/test";
import { LoginPage } from "../page/LoginPage";
import { takeScreenshot } from "../util/util";
import { TagPage } from "../page/TagPage";
import { faker } from "@faker-js/faker";


/*
    Test Case: EP017 - Verify tag should have a name
*/
test("EP017 - Verify @Tag should have a name", async ({
    page
}, testInfo) => {
    const loginPage = new LoginPage(page);
    const tagPage = new TagPage(page);
    const tagDescription = faker.lorem.sentence();
    const tagSlug = faker.lorem.slug();

    // Given: User is logged in
    await loginPage.open();
    await loginPage.login();
    await takeScreenshot(page, testInfo, "Login");

    // And Navigate to the tag page
    await tagPage.open();
    await takeScreenshot(page, testInfo, "Tag Page");

    // When I save the tag without filling the name
    await tagPage.fillTagDescription(tagDescription);
    await tagPage.fillTagSlug(tagSlug);
    await tagPage.saveTag();
    const error = await tagPage.getSaveFailure();
    await takeScreenshot(page, testInfo, "Tag Create Error");

    // Then It should show an error
    expect(await error.isVisible()).toBeTruthy();
    expect(await error.innerText()).toBe('Retry');
});