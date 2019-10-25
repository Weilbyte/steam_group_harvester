const axios = require('axios');
const progress = require('cli-progress');

const chewer = require('./chewer');

const barConfig = {
    format: '{status} |' + '{bar}' + '| {percentage}%',
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
    hideCursor: true
};

module.exports = async (groupID) => {
    const multibar = new progress.MultiBar(barConfig);
    const totalPageNum = await getPageCount(groupID);
    const totalMembers = await getMemberCount(groupID);
    const barGather = multibar.create(totalPageNum, 0, {"status": "Preparing.."});
    const barProcess = multibar.create(totalMembers, 0, {"status": "Waiting to gather.."});
    console.log(`Page count: ${totalPageNum} | Estimated time: ${totalPageNum}s`);
    await new Promise(done => setTimeout(done, 300));
    dispatch(groupID, totalPageNum, barGather).then(() => {
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
            bar.update(curPage, {status: "Waiting.."});
            await new Promise(done => setTimeout(done, 10000));
            rate = 0;
        }
        bar.update(curPage, {status: "Gathering.."});
        await requestPage(groupID, curPage).catch(console.error);
        rate++;
    }
    bar.update(totalPageNum, {status: "Gathered!"});
}

async function requestPage(groupID, page) {
    const response = await axios.get(`https://steamcommunity.com/groups/${groupID}/memberslistxml/?xml=1&p=${page}`);
    const json = chewer.xmlToJSON(response.data);
    await chewer.chewPage(json);
}

async function getPageCount(groupID) {
    const response = await axios.get(`https://steamcommunity.com/groups/${groupID}/memberslistxml/?xml=1`);
    const json = chewer.xmlToJSON(response.data);
    return json['elements']['0']['elements']['3']['elements']['0']['text'];
}

async function getMemberCount(groupID) {
    const response = await axios.get(`https://steamcommunity.com/groups/${groupID}/memberslistxml/?xml=1`);
    const json = chewer.xmlToJSON(response.data);
    return json['elements']['0']['elements']['2']['elements']['0']['text'];
}

