import test, { expect } from "@playwright/test";
import { LoginPage } from "../page/LoginPage";
import { TagPage } from "../page/TagPage";
import { takeScreenshot } from "../util/util";
import { faker } from "@faker-js/faker";



/*
    Test Case: EP016 - Verify create new Tag
*/
test("EP016 - Verify create new @Tag", async ({
    page
}, testInfo) => {
    const loginPage = new LoginPage(page);
    const tagPage = new TagPage(page);
    const tagName = faker.lorem.word();

    // Given: User is logged in
    await loginPage.open();
    await loginPage.login();
    await takeScreenshot(page, testInfo, "Login");
    // And Navigate to the tag page
    await tagPage.open();
    await takeScreenshot(page, testInfo, "Tag Page");
    // When I fill the tag name
    await tagPage.fillTagName(tagName);

    async function getSaveTagResponse() {
        const responsePromise = await page.waitForResponse(async (response) => {
            if (!response.url().includes('tags')) return false;
            return response.status() === 201 || response.status() === 200;
        });
        return responsePromise.json();
    }
    // And I save the tag
    await tagPage.saveTag();
    const response = await getSaveTagResponse();
    // Then It should create the tag and return the name
    await takeScreenshot(page, testInfo, "Tag Created");
    expect(response.tags[0].name).toBe(tagName);
});