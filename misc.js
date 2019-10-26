const fs = require('fs');

var APIKey;
const APIKeyFile = "./api.key"

module.exports = {
    estimateTime: function(pages, members) {
        var seconds = (pages + (pages * 0.100) + (members * 0.010)).toFixed(1);
        if (seconds > 59.9) {
            var minutes = (seconds/60).toFixed(0);
            var leftover = (seconds%60).toFixed(0);
            if (leftover > 0) {
                return `${minutes}m ${leftover}s`;
            }
            return `${minutes.toFixed(0)}m`;
        }
        return `${seconds}s`;
    },
    loadKey: function() {
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
    },
    getKey: async function() {
        if (APIKey != null) return APIKey;
        console.log("\nPut your API key in the api.key file.");
        process.exit(1);
    }
}

