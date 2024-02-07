#! /usr/bin/env node
/**
 * UpdateDB Node JS
 * 
 * Use this program to update Redis DB once a change to the language DB has been made.
 * This way, when one language gets a key added, all the other languages will get the same changes applied to them.
 * 
 * Usage:
 * Just run the script using node path/to/script/index.js with no arguments
 * Every DB entry with a proper ISO 639 language code will get checked
 * - e.g.   de:index
 *          en:index
 *          ...
 * 
 * If an entry should not be checked, even if it has a language code, then a $ can be added after the colon
 * - e.g.   de:index    will be checked
 *          de:$index   will NOT be checked
 * 
 * © Oliver Pauls 2024
 */

// ANSI
const c_reset   = '\x1b[0m';
const c_black   = '\x1b[90m';
const c_green   = '\x1b[92m';
const c_red     = '\x1b[91m';

const prompt = require('prompt-sync')({ sigint: true });

// DB
const redis = require('redis').createClient({ url: 'redis://127.0.0.1:6379' })
    .on('error', err => console.log('Redis Client Error', err))
    .connect();

module.exports = {
    redis
};

const { compareArrays } = require('./lib/functions');

// Main
(async () => {
    let regex = /^(.{2}):([^$].+)/;   // matches aa:~$...
    let entries  = [];
    let langs = [];
    let sites = [];

    let allEntries = (await (await redis).SCAN(0)).keys;
    for (let entry of await allEntries) {
        let match = entry.match(regex);
        if (match) {
            entries.push(match[0]);
            if (!langs.includes(match[1])) { langs.push(match[1]); }
            if (!sites.includes(match[2])) { sites.push(match[2]); }
        }
    }

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
        let keys = await compareArrays(entries.filter(e => e.substring(3) == site));
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
})();

function confirmation(message) {
    let input = prompt(`${message} [Y/n]? `);
    return !input || input.toLowerCase() == 'y';
}