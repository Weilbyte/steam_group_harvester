const axios = require('axios');
const chewer = require('./chewer');

module.exports = async (groupID) => {
    var totalPageNum = await getPageCount(groupID);
    console.log(`Page count: ${totalPageNum} | Estimated time: ${estimateTime(totalPageNum)}`);
    setTimeout(() => {
        console.log('');
        dispatch(groupID, totalPageNum);
    }, 1000)
}

async function dispatch(groupID, totalPageNum) {
    for (curPage=1; curPage <= totalPageNum; curPage++) {
        var url = `https://steamcommunity.com/groups/${groupID}/memberslistxml/?xml=1&p=${curPage}`;
        console.log(url);
    }
}

async function getPageCount(groupID) {
    const response = await axios.get(`https://steamcommunity.com/groups/${groupID}/memberslistxml/?xml=1`);
    const json = chewer.xmlToJSON(response.data);
    return json['elements']['0']['elements']['3']['elements']['0']['text'];
}

function estimateTime(pageCount) {
    return pageCount/10 + 's';
}
