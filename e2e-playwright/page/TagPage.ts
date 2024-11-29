import { Locator, Page, TestInfo } from "@playwright/test";
import { Urls } from "../../shared/config";
import { VERSION } from "../../shared/config";

export interface TagData {
    name?: string,
    slug?: string,
    color?: string,
    description?: string,
}


export class TagPage {
    readonly page: Page;

    // elements
    readonly ButtonSave: Locator;
    readonly ButtonSaveFailure: Locator;
    readonly save: Locator;
    readonly saved: Locator;
    readonly retry: Locator;
    readonly name: Locator;
    readonly slug: Locator;
    readonly color: Locator;
    readonly description: Locator;

    constructor(
        page: Page,
        testInfo: TestInfo = { title: "__ignore__" } as TestInfo
    ) {
        this.page = page;
        this.ButtonSave = VERSION === "4.5" ? page.locator("span:has-text('Save')") : page.locator('[data-test-button="save"]');
        this.ButtonSaveFailure = VERSION === "4.5" ? page.locator("span:has-text('Retry')") : page.locator('[data-test-button="save"]');
        this.saved = page.locator('button:has-text("Saved")');
        this.retry = page.locator('button:has-text("Retry")');
        this.save = page.locator('button:has-text("Save")');
        this.name = page.locator('#tag-name');
        this.slug = page.locator('#tag-slug');
        this.description = page.locator('#tag-description');
        this.color = page.locator('.input-color').locator('input[type="text"]');
    }

    async open() {
        await this.page.goto(Urls["tag/new"], { waitUntil: "networkidle" });
    }

    async openInternalTags() {
        await this.page.goto(Urls["tag/internal-list"], { waitUntil: "networkidle" });
    }

    async fillTagName(name: string) {
        const tagName = await this.page.locator('input[name="name"]');
        await tagName.fill(name);
    }

    async saveTag() {
        await this.ButtonSave.click();
    }

    async getSaveFailure() {
        return this.ButtonSaveFailure;
    }

    async fillTagDescription(description: string) {
        const tagDescription = this.page.locator('textarea[name="description"]');
        await tagDescription.fill(description);
    }

    async fillTagSlug(slug: string) {
        const tagSlug = this.page.locator('input[name="slug"]');
        await tagSlug.fill(slug);
    }

    async getInternalTagsList() {
        const internalTag = this.page.locator('[href="#/tags/hash-internal-tag/"]');
        return internalTag;
    }

    async createTag(fields: TagData): Promise<boolean> {
        await this.fillValues(fields);
        let watchdog = [
            this.retry.elementHandle({ timeout: 5000 }),
            this.saved.elementHandle({ timeout: 5000 }),
        ]
        await this.save.click();
        let result = await Promise.race(watchdog)
        let text = await result?.innerText()
        if (text) {
            if (text.includes('Saved')) {
                return true;
            } else if (text.includes('Retry')) {
                return false;
            } else {
                throw new Error('Unknown error');
            }
        } else {
            throw new Error('Timeout, not saved nor retry');
        }
    }

    async fillValues(fields: TagData): Promise<void> {
        let entries = Object.entries(fields);
        let buttons = await this.page.$$('.gh-btn-expand');
        for (const button of buttons) {
            await button.click();
        }
        for (let [key, value] of entries) {
            let locator = this[key];
            if (locator) {
                await locator.fill('');
                await locator.fill(value);
            }
        }
    }
}
