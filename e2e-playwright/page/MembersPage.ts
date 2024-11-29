import { Locator, Page, TestInfo } from "@playwright/test";
import { Urls } from "../../shared/config";
import { takeScreenshot } from "../util/util";

const listUrl = Urls.membersList;
const createUrl = Urls.membersCreate;

export class MembersPage {
  readonly page: Page;
  readonly testInfo: TestInfo;
  readonly newMember: Locator;
  readonly name: Locator;
  readonly email: Locator;
  readonly notes: Locator;
  readonly save: Locator;
  readonly saved: Locator;
  readonly retry: Locator;
  readonly invalidEmail: Locator;
  readonly label: Locator;


  constructor(
    page: Page,
    testInfo: TestInfo = { title: "__ignore__" } as TestInfo
  ) {
    this.page = page;
    this.testInfo = testInfo;
    this.newMember = page.locator('a:has-text("New Member")');
    this.name = page.locator('input[id="member-name"]');
    this.email = page.locator('input[id="member-email"]');
    this.notes = page.locator('textarea[id="member-note"]');
    this.save = page.locator('button:has-text("Save")');
    this.saved = page.locator('button:has-text("Saved")');
    this.retry = page.locator('button:has-text("Retry")');
    this.label = page.locator("input[type='search']");
    this.invalidEmail = page.locator(
      'p[class="response"] >> text="Invalid Email."'
    );
  }

  async open() {
    if (!listUrl.includes(this.page.url())) {
      await this.page.goto(listUrl, { waitUntil: "networkidle" });
    }
  }

  async openMember(email: string) {
    await this.open();
    // await takeScreenshot(this.page);
    await this.containsEmail(email).click();
  }

  containsName(name: string): Locator {
    return this.page.locator("h3", { hasText: name });
  }

  containsEmail(email: string): Locator {
    return this.page.locator("p", { hasText: email });
  }

  async createMember(name: string, email: string, notes: string) {
    await this.open();
    await takeScreenshot(this.page, this.testInfo, "Members Page");
    await this.newMember.click();

    await this.name.fill(name);
    await this.email.fill(email);
    await this.notes.fill(notes);
    await takeScreenshot(this.page, this.testInfo, "Create Member");

    await this.save.click();
    await this.page.waitForLoadState("networkidle", { timeout: 2000 });

    // Sometimes this buutton blocks the nav even if the request is done
    await this.page.waitForTimeout(2000);
  }

  async editMember(
    email: string,
    name: string,
    newEmail: string,
    notes: string
  ) {
    await this.openMember(email);

    await this.name.fill(name);
    await this.email.fill(newEmail);
    await this.notes.fill(notes);
    await takeScreenshot(this.page, this.testInfo, "Edit Member");

    await this.save.click();
    await this.page.waitForLoadState("networkidle");
  }

  async creationStatus(): Promise<boolean> {
    if ((await this.retry.count()) == 1) {
      return false;
    }
    return true;
  }

  async createMemberDataValidation({ name, email, notes, labels }: { name?: string, email?: string, notes?: string, labels?: string[] }): Promise<boolean> {
    await this.open();
    await this.newMember.click();

    if (name) {
      await this.name.fill('');
      await this.name.fill(name);
    }

    if (email) {
      await this.email.fill('');
      await this.email.fill(email);
    }

    if (notes) {
      await this.notes.fill('');
      await this.notes.fill(notes);
    }

    if (labels) {
      if (Array.isArray(labels)) {
        for (let l of labels) {
          await this.label.type(l, { delay: 5 });
          await this.label.focus();
          await this.page.keyboard.press('Enter');
        }
      } else {
        await this.label.type(labels, { delay: 5 });
        await this.label.focus();
        await this.page.keyboard.press('Enter');
      }
    }

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
      throw new Error('Timeout');
    }
  }
}
