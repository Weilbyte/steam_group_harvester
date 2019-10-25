const convert = require('xml-js');

const SteamIDList = [];

module.exports = {
    xmlToJSON: function(xml) {
        return JSON.parse(convert.xml2json(xml, {compact: false}));
    },
    chewPage: async function(json) {
        const memberListElement = getMemberElement(json);
        const memberList = json['elements']['0']['elements'][memberListElement]['elements']
        const objMemberList = Object.keys(memberList);
        objMemberList.forEach(function(member) {
            let steamID = memberList[member]['elements']['0']['text'];
            SteamIDList.push(steamID);
        })
    },
    chewIDs: async function() {
        console.log(`\nAmount of IDs: ${SteamIDList.length}`);
    }
};

function getMemberElement(json) {
    const root = json['elements']['0']['elements'];
    var result = null;
    Object.keys(root).forEach(function(element) {
        if ((root[element]['name']) === 'members') {
            result = element;
        };
    });
    return result;
}

function processID(steamID) {

}