const misc = require('./misc');
const runner = require('./runner');
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

var groupID = null;

module.exports = {
    groupID: groupID
}

misc.loadKey();
console.log('[you lay eyes upon steam_group_harvester]\n');
readline.question('Enter group ID: ', async (groupid) => {
    groupID = groupid;
    runner.start();
});