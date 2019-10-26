const convert = require('xml-js');
const axios = require('axios');

const misc = require('./misc');
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
    chewIDs: async function(bar) {
        var profileList = new Object();
        key = await misc.getKey();
        SteamIDList.forEach(async function(steamID, i){
            bar.update(++i);
            const [username, country, state] = await chewProfile(steamID).catch(console.error);
            profileList[steamID] = {
                "username": username,
                "country": country,
                "state": state
            };
        });
        await misc.createResultFile(profileList);
        bar.stop();
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

async function chewProfile(steamID) {
    var key = await misc.getKey();
    await new Promise(done => setTimeout(done, 10));
    const response = await axios.get(`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${key}&steamids=${steamID}`);
    const profile = JSON.parse(JSON.stringify(response.data))['response']['players'][0];
    var [username, country, state] = [profile['personaname'],"N/A",""];
    if (profile['loccountrycode'] != null) {
        country = profile['loccountrycode'];
        if (country === 'US') {
            if (profile['locstatecode'] != null) state = profile['locstatecode'];
        }
    }
    return [username, country, state];
}