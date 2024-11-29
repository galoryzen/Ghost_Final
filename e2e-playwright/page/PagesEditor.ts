import { Page, Locator, TestInfo } from "@playwright/test";
import { Urls } from "../../shared/config";
import { faker } from '@faker-js/faker';
import { takeScreenshot } from "../util/util";
import { VERSION } from "../../shared/config";

export class PagesEditor {
    readonly page: Page;
    readonly testInfo: TestInfo;

    constructor(page: Page, testInfo: TestInfo = { title: '__ignore__' } as TestInfo) {
        this.page = page;
        this.testInfo = testInfo;
    }

    async open() {
        await this.page.goto(Urls.listPage, { waitUntil: "load" });
        await takeScreenshot(this.page, this.testInfo, "Post List");
    }

    async getCreatedPages(): Promise<string> {

        let container = await this.getPageElements();
        let CreatedPages = "{pages: ";

        for(const element of container) {
            CreatedPages += await element.innerText();
            CreatedPages += ", ";
        }

        CreatedPages += "}"

        return CreatedPages;
    }

    async getPageElements(): Promise<Locator[]> {
        if (VERSION === "4.5") {
            return await this.page.locator('h3.gh-content-entry-title').all();
        }
        return await this.page.locator('h3').all();
    }

    async createTestPage(name) {
        await this.page.click("text='New page'");

        // fill the first textarea with the name
        let title = this.page.locator('.gh-editor-title');
        await title.click();
        await title.fill(name);

        let content1 = this.page.locator('.kg-prose');
        let content2 = this.page.locator('.koenig-editor__editor.__mobiledoc-editor');

        // fill the first textarea with the random paragraph
        if (await content1.count() > 0) {
            await this.page.fill('.kg-prose', faker.lorem.paragraph());
        } else if (await content2.count() > 0) {
            await content2.fill(faker.lorem.paragraph());
        } else {
            console.log('Neither content1 nor content2 exists on the page.');
        }

        await takeScreenshot(this.page, this.testInfo, "Page Created");

        await this.page.click("text='Publish'");

        let btnOld = this.page.locator('.gh-publishmenu-button');
        if (await btnOld.count() > 0) {
            await btnOld.click();
        } else {
            await this.page.click(".gh-publish-cta");
            await this.page.click('.gh-publish-cta', { position: { x: 5, y: 5 } });
            await this.page.click(".close");
        }
    }

    async editPage(name) {

        let pages = await this.getPageElements();

        for (const page of pages) {
            if (await page.innerText() == name) {
                await this.clickEditButton(page);
                break;
            }
        }

        await takeScreenshot(this.page, this.testInfo, "Edit Page");
    }

    async clickEditButton(page: Locator): Promise<void> {
        if (VERSION === "4.5") {
            let button = this.page.locator('[href^="#/editor/page/"]');
            await button.click();
            return
        }
        if(VERSION === "5.96.0") {
            let button = page.locator("..").locator("..");
            await button.locator("svg").click();
            return
        }
        return;
    }


    async getPageStatus(name): Promise<string> {

        let pages = await this.page.locator('h3');
        let pagesCount = await pages.count();
        let pagecontainer;

        for (let i = 0; i < pagesCount; i++) {
            let pageMenu = pages.nth(i);
            if (await pageMenu.innerText() == name) {
                pagecontainer = pageMenu.locator("..").locator("..");
                break;
            }
        }

        let statusContainer = pagecontainer.locator(".gh-content-entry-status");

        let status = statusContainer.innerText();
        return status;

    }

    createRandomName(): string {
        return faker.lorem.words();
    }

    getDefaultUrl(name: string): string {
        return name.toLowerCase().replace(/ /g, "-");
    }

}

