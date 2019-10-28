const convert = require('xml-js');
const axios = require('axios');

const misc = require('./misc');
const SteamIDList = [];

module.exports = {
    xmlToJSON: xmlToJSON,
    chewPage: chewPage,
    chewIDs: chewIDs
}

function xmlToJSON(xml) {
    return JSON.parse(convert.xml2json(xml, {compact: false}));
}

async function chewPage(json) {
    const memberListElement = getMemberElement(json);
    const memberList = json['elements']['0']['elements'][memberListElement]['elements']
    const objMemberList = Object.keys(memberList);
    objMemberList.forEach(function(member) {
        let steamID = memberList[member]['elements']['0']['text'];
        SteamIDList.push(steamID);
    })
};

async function chewIDs(bar) { 
    const total = SteamIDList.length;
    var i=0;
    var profileList = {"profiles":{}};
    var queue = [];
    for (const steamID of SteamIDList) {
            bar.update(++i);
            queue.push(steamID);
            if ((queue.length === 100)||(i==total)) {
                const chewedQueue = await chewProfileQueue(queue);
                for (var chewedProfile in chewedQueue) {
                    const steamid = chewedQueue[chewedProfile]['steamid'];
                    profileList['profiles'][steamid] = {
                        "username": chewedQueue[chewedProfile]['username'],
                        "country": chewedQueue[chewedProfile]['country'],
                        "state": chewedQueue[chewedProfile]['state']
                    }
                }
                queue = [];
            }
        }
    await misc.createResultFile(profileList);
    bar.stop();
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
};

async function chewProfileQueue(profileQueue) {
    try {
        const url = await buildChewProfileQueueRequestUrl(profileQueue);
        const profiles = await sendChewProfileQueueRequest(url);
        const chewedProfilesObject = await buildChewedProfilesObject(profiles['response']['players']);
        return chewedProfilesObject;
    } catch (error) {
        console.log(error);
    }
};

async function buildChewProfileQueueRequestUrl(profileQueue) {
    var queueItem = 0;
    const key = await misc.getKey();
    var url = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${key}&steamids=`;
    for (const steamID in profileQueue) {
        queueItem++;
        if (queueItem === profileQueue.length) {
            url += `${profileQueue[steamID]}`;
        } else {
            url += `${profileQueue[steamID]},`;
        }
    }
    return url;
};

async function buildChewedProfilesObject(profiles) {
    var result = new Object();
    var profileNum = 0;
    for (var profile in profiles) {
        const steamid = profiles[profile]['steamid'];
        const username = await sanitizeUsername(profiles[profile]['personaname']);
        var [country, state] = ["N/A","N/A"];
        if (profiles[profile]['loccountrycode'] != null) {
            country = profiles[profile]['loccountrycode'];
            if (country === 'US') {
                if (profiles[profile]['locstatecode'] != null) state = profiles[profile]['locstatecode'];
            }
        }
        result[profileNum++] = {
            "steamid": steamid,
            "username": username,
            "country": country,
            "state": state
        };
    }
    return result;
};

async function sendChewProfileQueueRequest(requestUrl) {
    try {
        await new Promise(done => setTimeout(done, 1000));
        const response = await axios.get(requestUrl);
        const json = JSON.parse(JSON.stringify(response.data));
        return json;
    } catch (error) {
        if (error.response.status == 500) {
            await new Promise(done => setTimeout(done, 2000));
            return await sendChewProfileQueueRequest(requestUrl);
        }
    }
};

async function sanitizeUsername(username) {
    if (username != null) return username.replace(/'"/g,'').replace(/\\/g, "");
}