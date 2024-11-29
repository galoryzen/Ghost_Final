import { Locator, Page, TestInfo, expect } from "@playwright/test";
import { VERSION } from "../../shared/config";
import { takeScreenshot } from "../util/util";
import { faker } from "@faker-js/faker";

/**
 * This class is the base class for creating a new entity (page and post)
 * They are basically the same, but the only difference is the URL to open
 */
export class CreateEntity {
  readonly page: Page;
  readonly testInfo: TestInfo;

  constructor(
    page: Page,
    testInfo: TestInfo = { title: "__ignore__" } as TestInfo
  ) {
    this.page = page;
    this.testInfo = testInfo;
  }

  async open() {
    throw new Error("Method not implemented.");
  }

  async fillForm(
    entryName: string = faker.lorem.sentence(),
    entryParagraph: string = faker.lorem.paragraph()
  ): Promise<string> {
    // Fill in the title
    const entryTitle = await this.getPostTitleTextArea();
    entryTitle.focus();

    await expect(entryTitle).toBeVisible({ timeout: 5000 }); // Wait for the title field to be visible
    await entryTitle.fill(entryName);

    // This accesibilty hack is to press the Enter key to move to the next field (the post editor), this doesnt have any test-id
    await entryTitle.press("Enter");

    await this.page.keyboard.type(entryParagraph);

    await takeScreenshot(this.page, this.testInfo, "filled-form");

    return entryName;
  }

  async getPostTitleTextArea(): Promise<Locator> {
    return VERSION === "5.96.0"
      ? await this.page.locator(".gh-editor-title-container textarea")
      : await this.page.locator('textarea[placeholder="Page Title"]').first();
  }

  async getEditor(): Promise<Locator> {
    return this.page.locator("[data-kg='editor']");
  }

  async getEditorParagraph(): Promise<Locator> {
    return this.page.locator("[data-kg='editor']").locator("p").nth(1);
  }

  async getPublishButton(): Promise<Locator> {
    if (VERSION !== "5.96.0") {
      return this.page.locator(".gh-publishmenu");
    }

    const buttons = await this.page.getByRole("button").all();
    for (const button of buttons) {
      if ((await button.getAttribute("data-test-button")) === "publish-flow") {
        return button;
      }
    }

    throw new Error("Publish button not found");
  }

  async continuePublishButton(): Promise<Locator> {
    return this.page.locator("[data-test-button='continue']");
  }

  async publishRightNowButton(): Promise<Locator> {
    // search for abutton wiut an span inside that says "Publish"
    if (VERSION !== "5.96.0") {
      const buttons = await this.page.locator("button").all();

      for (const button of buttons) {
        if ((await button.innerText()).includes("Publish")) {
          return button;
        }
      }

      throw new Error("Publish button not found");
    }

    return this.page.locator("[data-test-button='confirm-publish']");
  }

  async PublishPostOldVersion(): Promise<void> {
    const publishButton = await this.getPublishButton();
    await expect(publishButton).toBeVisible({ timeout: 5000 });
    await publishButton.click();

    const finalPublishButton = await this.publishRightNowButton();

    await expect(finalPublishButton).toBeVisible({ timeout: 5000 });

    finalPublishButton.click();

    await this.page.waitForTimeout(2000);

    await this.page.keyboard.press("Escape");
  }

  async PublishPostNewVersion(): Promise<void> {
    const publishButton = await this.getPublishButton();
    await expect(publishButton).toBeVisible({ timeout: 5000 });
    await publishButton.click();

    const continueButton = await this.continuePublishButton();
    await expect(continueButton).toBeVisible({ timeout: 5000 });
    await continueButton.click();

    const finalPublishButton = await this.publishRightNowButton();
    await expect(finalPublishButton).toBeVisible({ timeout: 5000 });

    await finalPublishButton.evaluate((el: any) => el.click());

    await this.page.waitForTimeout(2000);

    await this.page.keyboard.press("Escape");
  }

  async publishPost(): Promise<void> {
    if (VERSION !== "5.96.0") {
      await this.PublishPostOldVersion();
    } else {
      await this.PublishPostNewVersion();
    }

    await takeScreenshot(this.page, this.testInfo, "published-post");
  }
}
