import { Page, TestInfo } from "@playwright/test";
import { SiteConfig, Urls } from "../../shared/config";
import { takeScreenshot } from "../util/util";

export class LoginPage {
  readonly page: Page;
  readonly testInfo: TestInfo;
  private attempts: number = 3;

  constructor(
    page: Page,
    testInfo: TestInfo = { title: "__ignore__" } as TestInfo
  ) {
    this.page = page;
    this.testInfo = testInfo;
  }

  async open() {
    await this.page.goto(Urls.signin, { waitUntil: "networkidle" });
  }

  async login() {
    let attempts = 0;
    while (attempts < this.attempts) {
      try {
        attempts++;
        await this._login();
      } catch (e) { }
    }
  }

  // This function is called to setup the blog (Only once)
  async setup() {
    await this.page.waitForLoadState("networkidle");

    await takeScreenshot(this.page, this.testInfo, "setup-start");

    if (this.page.url().includes("one")) {
      await this.page.locator("section > a[href='#/setup/two/']").click();
    }

    await this.page.waitForSelector('input[id="blog-title"]');
    await this.page.fill('input[id="blog-title"]', SiteConfig.siteTitle);

    await this.page.fill('input[id="name"]', SiteConfig.name);
    await this.page.fill('input[id="email"]', SiteConfig.email);
    await this.page.fill('input[id="password"]', SiteConfig.password);
    await this.page.click('button[type="submit"]');

    await this.page.waitForLoadState("networkidle");
    // await 2 seconds
    await this.page.waitForTimeout(2000);

    console.log("Setup done");
    await takeScreenshot(this.page, this.testInfo, "setup-done");
  }

  async _login() {
    let curr_url = await this.page.url();

    if (curr_url.includes("setup")) {
      await this.setup();
    } else if (curr_url.includes("signin")) {
      await takeScreenshot(this.page, this.testInfo, "Login");
      await this.page.waitForSelector('input[type="email"]');
      await this.page.fill('input[type="email"]', SiteConfig.email);
      await this.page.fill('input[type="password"]', SiteConfig.password);
      await this.page.click('button[type="submit"]');
      await this.page.waitForNavigation({ waitUntil: "networkidle" });

      if (await this.page.url().includes("signin")) {
        throw new Error("Login failed");
      }
    } else if (curr_url.includes("dashboard")) {
      return;
    } else {
      throw new Error("Unknown page");
    }
  }

  async userIsLoggedIn(): Promise<boolean> {
    await this.page.goto(Urls.dashboard, { waitUntil: 'networkidle' });
    return this.page.url().includes('dashboard');
  }
}
