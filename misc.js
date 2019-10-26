const fs = require('fs');

const index = require('./index');

var APIKey;
const APIKeyFile = "./api.key";

module.exports = {
    createResultFile: createResultFile,
    estimateTime: estimateTime,
    converTime: convertTime,
    loadKey: loadKey,
    getKey: getKey
}

async function getKey() {
    if (APIKey != null) return APIKey;
    console.log("\nPut your API key in the api.key file.");
    process.exit(1);
}

function loadKey() {
    try {
        if (fs.existsSync(APIKeyFile)) {
            APIKey = fs.readFileSync(APIKeyFile, 'utf8');
            if (APIKey.length < 5) {
                console.log("\nPut your API key in the api.key file.");
                process.exit(1);
            }
        } else {
            fs.writeFileSync(APIKeyFile,'KEY');
            console.log("\nPut your API key in the api.key file.");
            process.exit(1);
        }
    } catch (error) {
        console.log(error);
    }
}

function estimateTime(pages, members) {
    var seconds = (pages + (pages * 0.100) + (members * 0.470)).toFixed(1);
    return convertTime(seconds);
}

async function createResultFile(json) {
    const ResultFile = `./profiles_${index.groupID}.json`; 
    const stringJson = JSON.stringify(json);
    fs.writeFileSync(ResultFile, stringJson);
}

function convertTime(seconds) {
    if (seconds > 59.9) {
        const minutes = (seconds/60).toFixed(0);
        const leftover = (seconds%60).toFixed(0);
        if (leftover > 0) {
            return `${minutes}m ${leftover}s`;
        }
        return `${minutes.toFixed(0)}m`;
    }
    return `${seconds}s`;
}

