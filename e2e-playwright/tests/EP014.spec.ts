import { test, expect } from "@playwright/test";
import { takeScreenshot } from "../util/util";
import { LoginPage } from "../page/LoginPage";
import { PagesEditor } from "../page/PagesEditor";



test("EP014 Check new page is visible in Pages Editor", async ({
    page
}, testInfo) => {
    const loginPage = new LoginPage(page, testInfo);
    const pagesEditor = new PagesEditor(page, testInfo);
    
    // Check if user is logged in
    await loginPage.open();
    await loginPage.login();

    // Create random name for the page
    let randomNamepage = pagesEditor.createRandomName();

    // Navigate to Pages Editor and Create a new Page
    await pagesEditor.open();
    await pagesEditor.createTestPage(randomNamepage);
    await page.setViewportSize({ width: 1920, height: 1080 });
    await takeScreenshot(page, testInfo, "Page Created");
    await pagesEditor.open();

    // Verify if the new page is visible on Editor
    const resultado = await pagesEditor.getCreatedPages();
    await takeScreenshot(page, testInfo, "Pages menu");
    expect(resultado).toContain(randomNamepage);
});