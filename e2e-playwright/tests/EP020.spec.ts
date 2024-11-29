import test, { expect } from "@playwright/test";
import { LoginPage } from "../page/LoginPage";
import { TagPage } from "../page/TagPage";
import { takeScreenshot } from "../util/util";
import { faker } from "@faker-js/faker";


/*
    Test Case: EP020 - Verify internal tag should be created
*/
test("EP020 - Verify internal tag creation", async ({
    page
}, testInfo) => {
    const loginPage = new LoginPage(page);
    const tagPage = new TagPage(page);
    const internalTagName = faker.lorem.word();

    // Given: User is logged in
    await loginPage.open();
    await loginPage.login();
    await takeScreenshot(page, testInfo, "Login");

    // And Navigate to the create tag page
    await tagPage.open();
    await takeScreenshot(page, testInfo, "Tag Page");
    // When I fill the tag name
    await tagPage.fillTagName('#'+internalTagName);
    // And I save the tag
    async function getSaveTagResponse() {
        const responsePromise = await page.waitForResponse(async (response) => {
            if (!response.url().includes('tags')) return false;
            return response.status() === 201 || response.status() === 200;
        });
        return responsePromise.json();
    }
    await tagPage.saveTag();
    const response = await getSaveTagResponse();
    await takeScreenshot(page, testInfo, "Tag Created");
    
    // And I navigate to the internal tags page
    await tagPage.openInternalTags();
    await takeScreenshot(page, testInfo, "Internal page");
    // Then It should show the internal tag
    const internalTag = await tagPage.getInternalTagsList();

    for (const li of await internalTag.all()) {
        expect(await li.isVisible()).toBeTruthy();
    }
});