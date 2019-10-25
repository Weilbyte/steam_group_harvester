const convert = require('xml-js');

module.exports = {
    xmlToJSON: function(xml) {
        return JSON.parse(convert.xml2json(xml, {compact: false}));
    }
};