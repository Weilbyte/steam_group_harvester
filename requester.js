const axios = require('axios');
const progress = require('cli-progress');

const chewer = require('./chewer');

module.exports = async (groupID) => {
    var totalPageNum = await getPageCount(groupID);
    console.log(`Page count: ${totalPageNum} | Estimated time: ${totalPageNum}s`);
    setTimeout(() => {
        console.log('');
        dispatch(groupID, totalPageNum);
    }, 1000)
}

async function dispatch(groupID, totalPageNum) {
    var rate = 0;
    const bar = new progress.SingleBar({
        format: '{status} |' + '{bar}' + '| {percentage}%',
        barCompleteChar: '\u2588',
        barIncompleteChar: '\u2591',
        hideCursor: true
    });
    bar.start(totalPageNum,1);
    for (curPage=1; curPage <= totalPageNum; curPage++) {
        if (rate >= 10) {
            bar.update(curPage, {status: "WAITING"});
            await new Promise(done => setTimeout(done, 10000));
            rate = 0;
        }
        bar.update(curPage, {status: "WORKING"});
        var url = `https://steamcommunity.com/groups/${groupID}/memberslistxml/?xml=1&p=${curPage}`;
        rate++;
    }
}

async function getPageCount(groupID) {
    const response = await axios.get(`https://steamcommunity.com/groups/${groupID}/memberslistxml/?xml=1`);
    const json = chewer.xmlToJSON(response.data);
    return json['elements']['0']['elements']['3']['elements']['0']['text'];
}
