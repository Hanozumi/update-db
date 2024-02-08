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

// DB
const redis = require('redis').createClient({ url: 'redis://127.0.0.1:6379' })
    .on('error', err => console.log('Redis Client Error', err))
    .connect();

const { Command } = require('commander');
const program = new Command();

program.name('update-db')
    .description('CLI for redis language managing')
    .version('0.5.0')
    .action(() => {
        require('./lib/main')(redis);
    });

program.command('ls')
    .description('Lists currently used languages and sites.')
    .action(() => {
        require('./lib/ls')(redis);
    });

program.parse();