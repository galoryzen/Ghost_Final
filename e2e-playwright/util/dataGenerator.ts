import { faker } from "@faker-js/faker";
import { writeFileSync, readFileSync } from "fs";
import { StaffData } from "../page/StaffPage";
import { TagData } from "../page/TagPage";

const APRIORI_FILE = "apriori.json";
const DATA_POOL_GEN_PER_SCENARIO = 100;

export type DataPoolType = 'apriori' | 'dynamic' | 'random';
export const DataPools: DataPoolType[] = ['apriori', 'dynamic', 'random'];

type DataPool = Record<ScenarioIdentifier, ScenarioDataPool>;
type Model = 'member' | 'staff' | 'tag';
type ScenarioIdentifier = string
type ScenarioDataPool = Member[] | Staff[] | Tag[];

type Member = {
    name: string;
    email: string;
    notes: string;
    labels: string[];
};

type Staff = StaffData
type Tag = TagData

interface FieldOption {
    number?: number,
    length?: number,
    omit?: boolean,
    kind?: string,
    once?: boolean,
    generator?: () => string,
}

type DataOptions = Partial<Record<keyof Member | keyof Staff | keyof Tag, FieldOption>>

export interface ScenarioConfig {
    title: string,
    oracle: boolean,  // Should the scenario pass or not
    data: DataOptions,
    model: Model,
    pool?: DataPoolType,  // Used after the fact, chosen randomly
}

type ScenarioSchema = Record<string, ScenarioConfig>;
export const Scenarios: ScenarioSchema = {
    emojiName: {
        title: "Emoji Name",
        oracle: true,
        data: {
            name: { kind: 'emoji' },
        },
        model: 'member',
    },
    normalEmail: {
        title: "Normal Email",
        oracle: true,
        data: {
            email: { length: 30 },
        },
        model: 'member',
    },
    invalidEmail: {
        title: "Invalid Email",
        oracle: false,
        data: { email: { kind: 'invalid' } },
        model: 'member',
    },
    quotedEmoji: {
        title: "[BUG] Quoted emojis email",
        oracle: false,
        data: { email: { kind: 'quotedEmoji' } },
        model: 'member',
    },
    internationalizedEmail: {
        title: "[BUG] Internationalized email",
        oracle: false,
        data: { email: { kind: 'international' } },
        model: 'member',
    },
    weirdSite: {
        title: "[BUG] Weird site",
        oracle: false,
        data: { website: { kind: 'weird' } },
        model: 'staff',
    },
    shortIpv4: {
        title: "[BUG] Short ipv4 website",
        oracle: false,
        data: { website: { kind: 'shortIpv4' } },
        model: 'staff',
    },
    decimalWebsite: {
        title: "[BUG] Website all decimal numbers",
        oracle: false,
        data: { website: { kind: 'decimal' } },
        model: 'staff',
    },
    emptyPort: {
        title: "[BUG] Website with Empty port",
        oracle: false,
        data: { website: { kind: 'emptyPort' } },
        model: 'staff',
    },
    spaceInPathname: {
        title: "[BUG] Space in Website pathname",
        oracle: false,
        data: { website: { kind: 'spaceInPathname' } },
        model: 'staff',
    },
} as const;

export function getData({ pool, identifier }: { pool: DataPoolType, identifier: string }): Member | Staff | Tag {
    let config = Scenarios[identifier]
    let data: Member | Staff | Tag | undefined = undefined;
    if (!config) {
        throw new Error(`Unknown scenario: ${identifier}`)
    }

    switch (pool) {
        case 'apriori':
        case 'dynamic':
            data = getFromPool(identifier, pool)
            break;
        case 'random':
            if (config.model === 'member') {
                data = {
                    name: generateName(config.data.name || { once: true }),
                    email: generateEmail(config.data.email || { once: true }),
                    notes: generateNotes(config.data.notes || { once: true }),
                    labels: generateLabels(config.data.labels || { omit: true }),
                } as Member
            } else if (config.model === 'staff') {
                data = {
                    name: config.data.name && generateName(config.data.name),
                    email: config.data.email && generateEmail(config.data.email),
                    bio: config.data.bio && generateNotes(config.data.bio),
                    website: generateWebsite(config.data.website || { omit: true }),
                    twitter: generateName(config.data.twitter || { omit: true }),
                    facebook: generateName(config.data.facebook || { omit: true }),
                } as Staff
                data = Object.fromEntries(Object.entries(data).filter(([_, v]) => v !== undefined));
            } else if (config.model === 'tag') {
                data = {
                    name: generateTagName(config.data.name || { once: true }),
                    slug: generateName(config.data.slug || { once: true }),
                    description: generateNotes(config.data.description || { once: true }),
                    color: generateColor(config.data.color || { omit: true }),
                }
            }
            break;
        default:
            throw new Error('Unknown pool');
    }
    if (data) {
        return data
    } else {
        throw new Error('No data found')
    }
}

function generateColor(options: FieldOption): string {
    let color = '';
    if (options.kind === 'colorWithPound') {
        color = '$000000';
    } else if (options.kind === 'colorWithHash') {
        color = '#000000';
    } else if (options.kind === 'threeDigitColor') {
        color = 'fff';
    } else if (options.kind === 'invalidColor') {
        color = 'invalid';
    } else {
        let generator = () => faker.internet.color();
        color = stringGenerator({
            ...options,
            generator,
        });
        color = color.replace('#', '');
    }
    return color;
}

function generateEmail(options: FieldOption): string {
    let email = '';
    if (options.kind === 'invalid') {
        email = 'invalid';
    } else if (options.kind === 'noTLD') {
        email = 'test@ghost';
    } else if (options.kind === 'emoji') {
        email = '😀@' + faker.internet.domainName();
    } else if (options.kind === 'validEmoji') {
        email = '✨❤️@' + faker.internet.domainName();
    } else if (options.kind === 'consecutiveDots') {
        email = 'test@ghost..io';
    } else if (options.kind === 'firstDot') {
        email = '.' + faker.person.firstName() + '@' + faker.internet.domainName();
    } else if (options.kind === 'lastDot') {
        email = 'test.@' + faker.internet.domainName();
    } else if (options.kind === 'ip') {
        email = 'test@[' + faker.internet.ipv4() + ']';
    } else if (options.kind === 'ipv6') {
        email = 'test@[' + faker.internet.ipv6() + ']';
    } else if (options.kind === 'quotedStartingDot') {
        email = '".' + faker.word.noun() + '"@' + faker.internet.domainName();
    } else if (options.kind === 'quotedEndingDot') {
        email = '"' + faker.word.noun() + '."@' + faker.internet.domainName();
    } else if (options.kind === 'quotedConsecutiveDots') {
        email = '"test..test"@' + faker.internet.domainName();
    } else if (options.kind === 'quotedBannedChars') {
        email = '"(),:;<>[]"@' + faker.internet.domainName();
    } else if (options.kind === 'quotedWhitespace') {
        email = '"test test"@' + faker.internet.domainName();
    } else if (options.kind === 'long') {
        email = 'soyelemailmaslargodelmundoperomientrastantolohagosinfaker@elmundodelfaker-perosinfakerenverdadprefieroasiparaprobarweiofgjiweofjiowejf-fiojwejiojwfeij.com';
    } else if (options.kind === 'quotedEmoji') {
        email = '"🍺🕺🎉"@' + faker.internet.domainName();
    } else if (options.kind === 'international') {
        email = faker.person.firstName() + '@شبكةمايستر..شبكة';
    } else {
        let generator = () => faker.string.alphanumeric();
        email = emailGenerator({
            ...options,
            generator,
        });
    };
    return email;
}

function generateName(options: FieldOption): string {
    let name = '';
    if (options.kind === 'emoji') {
        return '😀';
    } else {
        let generator = () => faker.person.firstName();
        name = stringGenerator({
            ...options,
            generator,
        });
    }

    return name;
}

function generateTagName(options: FieldOption): string {
    let generator = () => faker.word.verb();
    return stringGenerator({
        ...options,
        generator,
    });
}

function generateLabels(options: FieldOption): string[] {
    let labels: string[] = [];
    let { number } = options;
    number = number || 1;
    number = options.omit ? 0 : number;
    let generator = () => faker.word.verb();
    for (let i = 0; i < number; i++) {
        labels.push(stringGenerator({
            ...options,
            generator,
        }));
    }
    return labels;
}

function generateWebsite(options: FieldOption): string {
    let res: string = '';
    if (options.kind === 'regular') {
        res = faker.internet.url();
    } else if (options.kind === 'noTLD') {
        res = faker.word.verb();
    } else if (options.kind === 'invalid') {
        res = 'invalid';
    } else if (options.kind === 'weird') {
        res = 'https://https:www.netmeister.org@www.netmeister.org://https://www.netmeister.org/?https://www.netmeister.org=#https://www.netmeister.org';
    } else if (options.kind === 'shortIpv4') {
        res = 'http://1.1';
    } else if (options.kind === 'decimal') {
        res = 'http://2790524771';
    } else if (options.kind === 'emptyPort') {
        res = faker.internet.url();
        // replace a / if it exists at the end
        res = res.replace(/\/$/, '');
        res += ':' + '/' + faker.person.firstName() + '/' + faker.person.lastName();
    } else if (options.kind === 'spaceInPathname') {
        res = 'https://www.netmeister.org/blog/urls/ /f';
    } else {
        let generator = () => faker.string.alphanumeric();
        res = stringGenerator({
            ...options,
            generator,
        })
        if (options.length) {
            res = res.slice(0, options.length - 4) + '.com'
        }
    }
    return res;
}

function generateNotes(options: FieldOption): string {
    let generator = () => faker.lorem.paragraph(1);
    return stringGenerator({
        ...options,
        generator,
    });
}

// Generates a string from a given generator function matching the given
// options. For example generate a name using faker.name.findName, if the name
// needs to be 100 character longs keep string concatenating or slicing until
// it's 100 characters long.
function stringGenerator({ length, generator, omit, once }: FieldOption):
    string {
    let res = '';

    if (length) {
        while (res.length < length) {
            if (!generator) {
                throw new Error('generator is not defined');
            }
            res += generator();
        }
        if (res.length > length) {
            // Slice from the right
            res = res.slice(0, length);
        }
    }

    if (once === true) {
        // Once it's the default value, meaning one call to the generator
        if (!generator) {
            throw new Error('generator is not defined');
        }
        return generator();
    } else if (omit === true) {
        // Omit is true, return empty string
        return res
    }

    // If it ends with a space, change it for a random alphaNumeric, since ghost
    // removes trailing whitespaces in some fileds
    if (res.endsWith(' ')) {
        res = res.slice(0, -1) + faker.string.alphanumeric(1);
    }

    // Return a random string from the generator function compying with the given characteristics.
    return res;
}

function emailGenerator({ length, generator, omit, once }: FieldOption): string {
    let res = '';

    if (omit === true) {
        return res;
    }

    res = faker.internet.email();

    if (length) {
        while (res.length < length) {
            res = faker.string.alphanumeric(1) + res;
        }
        if (res.length > length) {
            res = res.slice(res.length - length);
        }
    }

    return res;
}

let DynamicPool: DataPool;
let LoadedDP = false;

let AprioriPool: DataPool;
let LoadedAP = false;

function getFromPool(identifier: string, poolType: DataPoolType): Member | Staff {
    let pool: DataPool;
    if (poolType === 'dynamic') {
        // Generate pool
        if (!LoadedDP) {
            DynamicPool = generatePool(false);
            LoadedDP = true;
        }
        pool = DynamicPool;
    } else if (poolType === 'apriori') {
        if (!LoadedAP) {
            // Read from file
            AprioriPool = JSON.parse(readFileSync(APRIORI_FILE, 'utf8')) as DataPool;
            LoadedAP = true;
        }
        pool = AprioriPool;
    } else {
        throw new Error('Invalid pool type');
    }

    let scenarioPool = pool[identifier];
    if (!scenarioPool) {
        throw new Error('Invalid identifier' + identifier);
    }

    let random = Math.floor(Math.random() * scenarioPool.length);
    let data = scenarioPool[random];
    scenarioPool.splice(random, 1);
    return data;
}

export function generatePool(write: boolean = true, seed?: number): DataPool {
    if (seed) {
        faker.seed(seed);
    }
    let pool: DataPool = {};
    Object.entries(Scenarios).forEach(([identifier, _]) => {
        // For each of the member scenarios let's create a "smaller" "inner" pool
        // of size DATA_POOL_GEN_PER_SCENARIO
        let scenarioData: Array<Staff | Member> = [];
        for (let i = 0; i < DATA_POOL_GEN_PER_SCENARIO; i++) {
            scenarioData.push(getData({ pool: 'random', identifier: identifier }));
        }
        pool[identifier] = scenarioData;
    });

    if (write) {
        // Only pass write when we want to update the apriori data pool
        writeFileSync(APRIORI_FILE, JSON.stringify(pool, null, 2));
    }
    return pool;
}

if (require.main === module) {
    generatePool(true, 23);
}