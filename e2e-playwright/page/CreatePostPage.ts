import { Urls } from "../../shared/config";
import { takeScreenshot } from "../util/util";
import { CreateEntity } from "./CreateEntry";

export class CreatePostPage extends CreateEntity {
  async open() {
    await this.page.goto(Urls["post/new"], { waitUntil: "networkidle" });
    takeScreenshot(this.page, this.testInfo, "create-post");
  }
}
