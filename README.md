# steam_group_harvester

steam_group_harvester gets all the members of a steam community group and outputs their usernames and countries (and their states if applicable) into a JSON file. 

## Installation

### Requirements
* Node.js (and package manager)
* [Steam API](https://steamcommunity.com/dev/apikey) key
* Git

### Setup
Clone the repo    
`git clone https://github.com/Weilbyte/steam_group_harvester.git`    
Install dependencies  
`cd steam_group_harvester`  
`yarn install`   
Start it for the first time to generate the `api.key` file   
`yarn start`    
Afterwards just paste your Steam API key into said file

## Usage
Start steam_group_harvester with `yarn start`.      
Afterwards provide it the ID (*not* the groupID64) of a Steam community group.    
   
You should see two bars appear, the top one being for collecting the member's steam IDs and the bottom one being for querying said IDs to find the usernames, countries, etc.   

The speed depends on the group's size. 

### Rate Limits
steam_group_harvester uses two separate Steam APIs:
* **Community XML API** Used for collecting the member IDs. You might notice the bar stopping for a bit - this is because there is a delay that is used to respect the rate limit for this API.
* **Web API** Used for querying member IDs for data. There is no strict rate-limit for this but I have added a 100ms delay in-between requests in order to not strain their servers too badly. With your API key up to 100k requests can be made per day.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
