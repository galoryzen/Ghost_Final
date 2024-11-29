export const VERSION = process.env.GHOST_VERSION || '5.96.0';
export const PORT = parseInt(process.env.GHOST_PORT || '9333');
export const VISUAL_REGRESSION_TESTING = Boolean(process.env.GHOST_VRT || false);
export const CI = Boolean(process.env.CI || false);
export const URL = (process.env.GHOST_URL || 'http://localhost:' + PORT.toString()).replace(/\/$/, '');
export const IMAGE = `ghost:${VERSION}`;
export const CNAME = `ghost-testing`;

export const Urls = {
    main: URL,
    signin: `${URL}/ghost/#/signin`,
    setup: `${URL}/ghost/#/setup`,
    dashboard: `${URL}/ghost/#/dashboard`,
    membersList: `${URL}/ghost/#/members`,
    membersCreate: `${URL}/ghost/#/members/new`,
    listPage: `${URL}/ghost/#/pages`,
    "post/list": `${URL}/ghost/#/posts`,
    "tag/new": `${URL}/ghost/#/tags/new`,
    "post/new": `${URL}/ghost/#/editor/post`,
    pageNew: `${URL}/ghost/#/editor/pages`,
    "tag/internal-list": URL + "/ghost/#/tags?type=internal",
}

export const DEFAULT_POST_NAME = "Coming soon"

export const SiteConfig = {
    siteTitle: process.env.GHOST_SITE_NAME || 'Testing Site',
    password: process.env.GHOST_PASSWORD || 'VeryStrong!1',
    email: process.env.GHOST_EMAIL || 'tester@tester.com',
    name: process.env.GHOST_SITE_NAME || 'Testing Dude',
} as const
