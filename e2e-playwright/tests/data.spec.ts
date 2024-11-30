import { test, expect, TestInfo, Page } from '@playwright/test';
import { LoginPage } from '../page/LoginPage';
import { MembersPage } from '../page/MembersPage';
import { StaffPage } from '../page/StaffPage';
import { TagPage } from '../page/TagPage';
import { Cookie, nameDataScenario } from '../util/util';
import { Scenarios, ScenarioConfig, DataPools, getData } from '../util/dataGenerator';

// Run tests in parallel
test.describe.configure({ mode: 'parallel' });

type ScenarioTestConfig = {
  page: Page;
  testinfo: TestInfo;
  identifier: string;
  scenario: ScenarioConfig;
};

let poolCounter = 0;

/**
 * Cycles through data pools for distribution across tests.
 */
function getNextDataPool() {
  poolCounter++;
  return DataPools[poolCounter % DataPools.length];
}

/**
 * Handles the login process.
 */
async function login(page: Page, testinfo: TestInfo): Promise<void> {
  const loginPage = new LoginPage(page, testinfo);
  await loginPage.open();
  await loginPage.login();
  expect(await loginPage.userIsLoggedIn()).toBeTruthy();
}

/**
 * Executes the scenario logic based on its model.
 */
async function executeScenario(config: ScenarioTestConfig, cookie: Cookie): Promise<boolean> {
  const { page, testinfo, identifier, scenario } = config;
  const { oracle, model } = scenario;

  // Generate data for the scenario
  const data = getData({ identifier, pool: cookie.pool });

  if (model === 'member') {
    const membersPage = new MembersPage(page, testinfo);
    return await membersPage.createMemberDataValidation(data);

  } else if (model === 'staff') {
    const staffPage = new StaffPage(page, testinfo);
    await staffPage.open();
    let result = await staffPage.editStaff(data);

    // Retry once if save fails to avoid weird bug
    if (result === 2) result = await staffPage.editStaff(data);

    if (result === 2) throw new Error('Failed to save staff data');
    return result === 1;

  } else if (model === 'tag') {
    const tagPage = new TagPage(page, testinfo);
    await tagPage.open();
    return await tagPage.createTag(data);

  } else {
    throw new Error(`Unknown model: ${model}`);
  }
}

/**
 * Runs the test scenario.
 */
async function runScenario(config: ScenarioTestConfig, cookie: Cookie): Promise<void> {
  const { page, testinfo, scenario } = config;

  // Login before executing scenario
  await login(page, testinfo);

  // Execute the scenario logic
  const result = await executeScenario(config, cookie);

  // Verify the outcome
  expect(result).toBe(scenario.oracle);
}

// Track executed scenarios
const scenariosRun: Cookie[] = [];

// Generate and run tests dynamically
Object.entries(Scenarios).forEach(([identifier, scenario], index) => {
  const pool = getNextDataPool();
  const cookie: Cookie = { scenarios: [scenario], pool };

  var i = 20;
  // console log a md table
  console.log(`| ${i + index + 1} | 1 | DV | ${cookie.scenarios[0].title} |  |`);

  // test(nameDataScenario(cookie, index + 1), async ({ page }, testinfo) => {
  //   const config: ScenarioTestConfig = { page, testinfo, identifier, scenario };
  //   await runScenario(config, cookie);
  //   scenariosRun.push(cookie);
  // });
});
