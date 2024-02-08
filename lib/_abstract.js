/**
 * Universally required functions across files
 */

/**
 * Filters database by languages and individual sites
 * @param {import("redis").RedisClientType} redis 
 * @returns Object containing all valid entries, all languages and all sites
 */
async function getLangSite(redis) {
    let regex = /^(.{2}):([^$].+)/;   // matches aa:~$...
    let entries = [];
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

    return { entries: entries, langs: langs, sites: sites };
}

module.exports = {
    getLangSite
};