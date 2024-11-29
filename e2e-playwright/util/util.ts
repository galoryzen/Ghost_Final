import { chromium, Page, TestInfo } from "@playwright/test";
import { VERSION, VISUAL_REGRESSION_TESTING } from '../../shared/config';
import { startGhost } from "../../shared/runner.ts";
import { LoginPage } from "../page/LoginPage";
import { DataPoolType, ScenarioConfig } from "./dataGenerator.ts";

let counter = 0;
let baseDir = `./screenshots/playwright/`
export async function takeScreenshot(page: Page, testInfo: TestInfo, step: string) {
    if (VISUAL_REGRESSION_TESTING) {
        await page.waitForTimeout(1000);
        if (testInfo.title !== '__ignore__') {
            let stepNumber = String(counter++).padStart(3, '0');
            await page.screenshot({ path: `${baseDir}${VERSION}/${testInfo.title}/${stepNumber}_${step}.png`, fullPage: true });
        } else {
            await page.screenshot({ path: `${baseDir}${VERSION}/${testInfo.title}/${step}.png`, fullPage: true });
        }
    } else {
        await page.waitForTimeout(1000);
        await page.screenshot({ path: `${baseDir}NON_VRT/${testInfo.title}/${step}.png`, fullPage: true });
    }
}

export async function VRTBeforeAll() {
    if (VISUAL_REGRESSION_TESTING) {
        await startGhostAndSetup();
    }
}

export async function startGhostAndSetup() {
    await startGhost();
    const browser = await chromium.launch();
    const page = await browser.newPage();
    const login = new LoginPage(page);
    await login.open();
    await login.setup();
    await browser.close();
}

export type Cookie = {
    scenarios: ScenarioConfig[],
    pool: DataPoolType,
}

export function nameDataScenario(cookie: Cookie, counter: number): string {
    const parts: string[] = [];
    const multipleScenarios = cookie.scenarios.length > 1;

    cookie.scenarios.forEach((scenario, index) => {
        if (multipleScenarios) {
            parts.push(`S.${index + 1}`);
        }
        parts.push(
            `${capitalize(scenario.model)}: ${scenario.title} (${scenario.oracle ? '+' : '-'}) |`
        );
    });

    // Remove the trailing '|' if it exists
    if (parts.length > 0 && parts[parts.length - 1].endsWith('|')) {
        parts[parts.length - 1] = parts[parts.length - 1].slice(0, -2);
    }

    return `${counter}. [${cookie.pool}]: ${parts.join(' ')}`;
}

function capitalize(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1);
}
