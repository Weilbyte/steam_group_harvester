const requester = require('./requester');
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log('[you lay eyes upon steam_group_harvester]');
readline.question('Enter group ID: ', async (groupid) => {requester(groupid)});