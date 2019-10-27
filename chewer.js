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
        var i=0;
        var profileList = new Object();
        for (const steamID of SteamIDList) {
            try {
                const [username, country, state] = await chewProfile(steamID).catch(console.error);
                profileList[steamID] = {
                    "username": username,
                    "country": country,
                    "state": state
                };
                bar.update(++i);
            } catch (error) {
                if (error.response.status == 500) {
                    await new Promise(done => setTimeout(done, 1000));
                } else if (error.response.status == 429) {
                    await new Promise(done => setTimeout(done, 10000));
                } else {
                    console.log(error.response.status);
                }
            }

        }   
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
    try {
        var key = await misc.getKey();
        await new Promise(done => setTimeout(done, 100));
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
    } catch (error) {
        return error;
    }
}