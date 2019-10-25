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
    var totalPageNum = await getPageCount(groupID);
    console.log(`Page count: ${totalPageNum} | Estimated time: ${totalPageNum}s`);
    await new Promise(done => setTimeout(done, 300));
    dispatch(groupID, totalPageNum).then(() => {
        chewer.chewIDs().then(() => {
            process.exit(0);
        });
    })
}

async function dispatch(groupID, totalPageNum) {
    var rate = 0;
    const bar = new progress.SingleBar(barConfig);
    bar.start(totalPageNum,1, {status: "YEET"});
    for (curPage=1; curPage <= totalPageNum; curPage++) {
        await new Promise(done => setTimeout(done, 100));
        if (rate >= 10) {
            bar.update(curPage, {status: "WAITING"});
            await new Promise(done => setTimeout(done, 10000));
            rate = 0;
        }
        bar.update(curPage, {status: "WORKING"});
        await requestPage(groupID, curPage).catch(console.error);
        rate++;
    }
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
