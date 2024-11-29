import { test, expect } from "@playwright/test";
import { takeScreenshot } from "../util/util";
import { LoginPage } from "../page/LoginPage";
import { PagesEditor } from "../page/PagesEditor";
import { URL } from "../../shared/config";


test("EP015 Check new page is visible in edition mode", async ({
    page
}, testInfo) => {
    const loginPage = new LoginPage(page);
    const pagesEditor = new PagesEditor(page);

    // Chek if user is logged in
    await loginPage.open();
    await loginPage.login();

    // Create random name for the page
    let randomNamepage = pagesEditor.createRandomName();

    // Navigate to Pages Editor and Create a new Page
    await pagesEditor.open();
    await pagesEditor.createTestPage(randomNamepage);
    await takeScreenshot(page, testInfo, "Page Created");

    // Select edit option for the new Page
    await pagesEditor.editPage(randomNamepage);


    // Verify if new page opens in edit mode
    let activeUrl = await page.url();
    let expectedUrl = `${URL}/ghost/#/editor/page/`;
    expect(activeUrl).toContain(expectedUrl);
});