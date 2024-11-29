import * as fs from 'fs';
import { FullConfig } from "@playwright/test";
import { startGhostAndSetup } from "./e2e-playwright/util/util";
import { VERSION, VISUAL_REGRESSION_TESTING } from './shared/config.ts';

async function globalSetup(config: FullConfig) {
    if (VISUAL_REGRESSION_TESTING) {
        try {
            fs.rmSync(`./screenshots/playwright/${VERSION}`, { recursive: true, force: true });
        } catch (e) { }
    }
    await startGhostAndSetup();
}

export default globalSetup;