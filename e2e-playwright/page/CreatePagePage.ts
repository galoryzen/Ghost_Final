import { URL } from "../../shared/config";
import { takeScreenshot } from "../util/util";
import { CreateEntity } from "./CreateEntry";

export class CreatePagePage extends CreateEntity {
  async open() {
    const pageNew = `${URL}/ghost/#/editor/page`;
    await this.page.goto(pageNew, { waitUntil: "networkidle" });
    await takeScreenshot(this.page, this.testInfo, "create-page");
  }
}
