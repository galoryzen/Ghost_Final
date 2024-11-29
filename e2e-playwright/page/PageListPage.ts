import { Locator, Page } from "@playwright/test";
import { URL, VERSION } from "../../shared/config";

export class PageListPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async open() {
    const listPage = `${URL}/ghost/#/pages`;
    await this.page.goto(listPage, { waitUntil: "networkidle" });
  }

  async getPageTableRows(): Promise<Locator[]> {
    return VERSION === "5.96.0"
      ? await this.page.locator(".gh-posts-list-item-group").all()
      : await this.page.locator(".gh-posts-list-item").all();
  }

  async getPagesTitles(): Promise<string[]> {
    const pageTitles = await this.page.locator(".gh-content-entry-title").all();

    return await Promise.all(
      pageTitles.map(async (title) => {
        return await title.innerText();
      })
    );
  }
}
