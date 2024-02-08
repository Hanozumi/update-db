/**
 * Core Functionality
 * 
 * Executed by calling 'update-db' without parameters
 */

// ANSI
const c_reset   = '\x1b[0m';
const c_black   = '\x1b[90m';
const c_green   = '\x1b[92m';
const c_red     = '\x1b[91m';

const abstract = require('./_abstract');
const { compareArrays } = require('./helper/_main');

const prompt = require('prompt-sync')({ sigint: true });

async function main(redis) {
    let dataLangSite = await abstract.getLangSite(redis);
    let entries  = dataLangSite.entries;
    let langs = dataLangSite.langs;
    let sites = dataLangSite.sites;

    // Check for new entries
    let newEntries = [];

    for (let site of sites) {
        for (let lang of langs) {
            if (!entries.includes(`${lang}:${site}`)) {
                newEntries.push(`${lang}:${site}`);
            }
        }
    }

    if (newEntries.length > 0) { 
        console.log('New DB entries can be created for:'); 
        for (let entry of newEntries) { console.log(`\t- ${entry}`); }
        if (confirmation('\nShould the listed entries be created')) {
            for (let entry of newEntries) {
                // finds first existing hash for requested hash creation
                let firstHash = (await (await redis).SCAN(0, { MATCH: `*:${entry.substring(3)}` })).keys[0];
                if (await (await redis).COPY(await firstHash, entry)) { console.log(`Successfully created ${entry}@DB0`); }
            }
        }
    } else {
        console.log('No new DB entries need to be created.');
    }

    console.log();

    // Check keys in entries
    /** @type {{key: any, values: any[]}[]} */
    let newKeys = [];

    for (let site of sites) {
        let keys = await compareArrays(redis, entries.filter(e => e.substring(3) == site));
        keys = keys.filter(key => key.values.length > 0);
        newKeys = newKeys.concat(keys);
    }

    if (newKeys.length > 0) {
        console.log('New keys can be created for:');
        for (let key of newKeys) {
            console.log(`\t${key.key}:`);
            process.stdout.write(c_black);
            for (let value of key.values) { console.log(`\t  - ${value}`); }
            process.stdout.write(c_reset);
        }
        if (confirmation('\nShould the listed keys be created')) {
            for (let key of newKeys) {
                let valueObj = {};
                for (let value of key.values) { valueObj[value] = '{PLACEHOLDER}'; }
                if (await (await redis).HSET(key.key, valueObj)) { console.log(`Successfully created keys for ${key.key}@DB0`); }
            }
        }
    } else {
        console.log('No new keys need to be created.');
    }

    process.exit();
}

function confirmation(message) {
    let input = prompt(`${message} [Y/n]? `);
    return !input || input.toLowerCase() == 'y';
}

module.exports = main;