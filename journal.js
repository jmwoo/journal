var moment = require('moment');
var colors = require('colors');
var mkdirp = require('mkdirp');
var readline = require('readline');
var path = require('path');
var fs = require('fs');
var argv = require('optimist')
    .alias('w', 'write')
    .alias('p', 'print')
    .alias('s', 'search')
    .argv;

var config = {"mfmt":"YYYY-MM-DD HH:mm:ss.SSS", 'entriesName':'main'};
var entriesDir = path.join(__dirname, 'entries');
var entriesFilename = path.join(entriesDir, config.entriesName + '.json');
var entries = JSON.parse(fs.readFileSync(entriesFilename));

var saveToFile = function() {
    fs.writeFile(entriesFilename, JSON.stringify(entries), function(err) {
        if (err) {
            throw err;
        }
    });
};

var write = function() {
    var rl = readline.createInterface(process.stdin, process.stdout);
    var prompt = '>>> ';
    rl.setPrompt(prompt, prompt.length);
    rl.prompt();
    rl.on('line', function(text) {
        text = text.trim();
        var id = 1;
        if (entries.length > 0) {
            id = entries[entries.length - 1].id + 1;
        }
        if (text) {
            entries.push({
                timestamp: moment().format(config.mfmt),
                text: text,
                id: id
            });
            saveToFile();
        }
        rl.prompt();
    });
};

var print = function(entriesToPrint) {
    console.log('');

    entriesToPrint.forEach(function (entry) {
        var amoment = moment(entry.timestamp);
        var displayMoment = amoment.format('dddd MMMM Do YYYY, h:mm:ss a');
        var displayId = (entry.id.toString()).green; 
        console.log("%s\n%s %s\n", displayMoment.red, displayId, entry.text);
    });

    console.log("total: %s\n", entriesToPrint.length.toString().yellow);
};

var search = function(regExpStr) {
    var flags = 'ig'; //case-insensitive, global
    var regExp = new RegExp(regExpStr, flags);

    var matchedEntries = entries.filter(function(entry) {
        return regExp.test(entry.text);
    });

    // add colored highlights for matches
    var coloredEntries = matchedEntries.map(function(entry) {
        regExp = new RegExp(regExpStr, flags); // have to reinitialize regexp here

        var wordMatches = [];
        var match;
        while (true) {
            match = regExp.exec(entry.text);
            if (match) {
                wordMatches.push(match[0]);
            } else {
                break;
            }
        }

        for (var _i = 0, _len = wordMatches.length; _i < _len; ++_i) {
            entry.text = entry.text.replace(regExp, wordMatches[_i].green);
        }

        return entry;
    });

    print(coloredEntries);
};

if (argv.write) {
    write();
} else if (argv.print) {
    print(entries);
} else if (argv.search) {
    search(argv.search);
}
