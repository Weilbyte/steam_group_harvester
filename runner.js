const axios = require('axios');
const progress = require('cli-progress');

const index = require('./index');
const chewer = require('./chewer');
const misc = require('./misc');

var groupID = null;

const barConfig = {
    format: '{activity}\t |' + '{bar}' + '| {percentage}%',
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
    hideCursor: true,
    clearOnComplete: false,
    stopOnComplete: false,
};

module.exports = {
    start: start
}

async function start() {
    groupID = index.groupID;
    const multibar = new progress.MultiBar(barConfig);
    const [totalPages, totalMembers] = await getGroupData(groupID);
    const estimate = misc.estimateTime(totalPages, totalMembers);
    const barGather = multibar.create(totalPages, 0, {"activity": "Gathering"});
    const barProc = multibar.create(totalMembers, 0, {"activity": "Processing"});
    console.log(`Estimated ${estimate} to go through ${totalPages} and ${totalMembers} members.\n`);
    await new Promise(done => setTimeout(done, 300));
    await dispatch(totalPages, barGather).catch(console.error);
    await chewer.chewIDs(barProc).catch(console.error);
    multibar.stop();
    process.exit(0);

}

async function dispatch(totalPageNum, bar) {
    var rate = 0;
    for (curPage=1; curPage <= totalPageNum; curPage++) {
        await new Promise(done => setTimeout(done, 100));
        if (rate >= 10) {
            await new Promise(done => setTimeout(done, 10000));
            rate = 0;
        }
        bar.update(curPage);
        await requestPage(curPage).catch(console.error);
        rate++;
    }
}

async function requestPage(page) {
    const response = await axios.get(`https://steamcommunity.com/groups/${groupID}/memberslistxml/?xml=1&p=${page}`);
    const json = chewer.xmlToJSON(response.data);
    await chewer.chewPage(json);
}

async function getGroupData() {
    const response = await axios.get(`https://steamcommunity.com/groups/${groupID}/memberslistxml/?xml=1`);
    const json = chewer.xmlToJSON(response.data);
    const pages = parseInt(json['elements']['0']['elements']['3']['elements']['0']['text']);
    const members = parseInt(json['elements']['0']['elements']['2']['elements']['0']['text']);
    return [pages, members];
}
