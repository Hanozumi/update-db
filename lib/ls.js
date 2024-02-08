/**
 * List all entries
 * 
 * Usage:
 * $ update-db ls   -- Lists all languages and sites
 */

// ANSI
const c_reset   = '\x1b[0m';
const c_black   = '\x1b[90m';
const c_green   = '\x1b[92m';
const c_red     = '\x1b[91m';

const abstract = require('./_abstract');

async function ls(redis) {
    let dataLangSite = await abstract.getLangSite(redis);
    
    console.log('Languages:');
    process.stdout.write(c_black);
    for (let lang of dataLangSite.langs) { console.log(`  - ${lang}`); }
    process.stdout.write(c_reset);

    console.log();

    console.log('Sites:');
    process.stdout.write(c_black);
    for (let site of dataLangSite.sites) { console.log(`  - ${site}`); }
    process.stdout.write(c_reset);

    process.exit();
}

module.exports = ls;