const axios = require('axios');
const progress = require('cli-progress');

const chewer = require('./chewer');

const barConfig = {
    format: '{activity}\t |' + '{bar}' + '| {percentage}%',
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
    hideCursor: true
};

module.exports = async (groupID) => {
    const multibar = new progress.MultiBar(barConfig);
    const [totalPages, totalMembers] = await getGroupData(groupID);
    const barGather = multibar.create(totalPages, 0, {"activity": "Gathering"});
    const barProcess = multibar.create(totalMembers, 0, {"activity": "Processing"});
    console.log(`Page count: ${totalPages} | Estimated time: ${totalPages}s`);
    await new Promise(done => setTimeout(done, 300));
    dispatch(groupID, totalPages, barGather).then(() => {
        chewer.chewIDs().then(() => {
            process.exit(0);
        });
    })
}

async function dispatch(groupID, totalPageNum, bar) {
    var rate = 0;
    for (curPage=1; curPage <= totalPageNum; curPage++) {
        await new Promise(done => setTimeout(done, 100));
        if (rate >= 10) {
            await new Promise(done => setTimeout(done, 10000));
            rate = 0;
        }
        bar.update(curPage);
        await requestPage(groupID, curPage).catch(console.error);
        rate++;
    }
}

async function requestPage(groupID, page) {
    const response = await axios.get(`https://steamcommunity.com/groups/${groupID}/memberslistxml/?xml=1&p=${page}`);
    const json = chewer.xmlToJSON(response.data);
    await chewer.chewPage(json);
}

async function getGroupData(groupID) {
    const response = await axios.get(`https://steamcommunity.com/groups/${groupID}/memberslistxml/?xml=1`);
    const json = chewer.xmlToJSON(response.data);
    const pages = json['elements']['0']['elements']['3']['elements']['0']['text'];
    const members = json['elements']['0']['elements']['2']['elements']['0']['text'];
    return [pages, members];
}
