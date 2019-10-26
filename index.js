const misc = require('./misc');
const requester = require('./requester');
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

misc.loadKey();
console.log('[you lay eyes upon steam_group_harvester]\n');
readline.question('Enter group ID: ', async (groupid) => {requester.start(groupid)});