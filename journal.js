var moment = require('moment');
var colors = require('colors');
var mkdirp = require('mkdirp');
var _ = require('lodash');
var readline = require('readline');
var path = require('path');
var fs = require('fs');
var argv = require('optimist')
    .alias('w', 'write')
    .alias('p', 'print')
    .alias('s', 'search')
    .argv;

var entriesFilename;
var entries;

var init = function (journalName) {
    if (!_.isString(journalName)) {
        journalName = 'main';
    }
    var entriesDir = path.join(__dirname, 'entries');
    mkdirp.sync(entriesDir);
    entriesFilename = path.join(entriesDir, journalName + '.json');
    entries = [];
    if (fs.existsSync(entriesFilename)) {
        entries = JSON.parse(fs.readFileSync(entriesFilename));
    }
};

var saveToFile = function () {
    fs.writeFile(entriesFilename, JSON.stringify(entries), function (err) {
        if (err) {
            throw err;
        }
    });
};

var write = function () {
    var rl = readline.createInterface(process.stdin, process.stdout);
    var prompt = '>>> ';
    rl.setPrompt(prompt, prompt.length);
    rl.prompt();
    rl.on('line', function (text) {
        text = text.trim();
        var id = 1;
        if (entries.length > 0) {
            id = entries[entries.length - 1].id + 1;
        }
        if (text) {
            entries.push({
                timestamp: new Date().toISOString(),
                text: text,
                id: id
            });
            saveToFile();
        }
        rl.prompt();
    });
};

var print = function (entriesToPrint, lastNentriesToPrint) {
    console.log('');

    if (_.isNumber(lastNentriesToPrint) && lastNentriesToPrint > 0) {
        if (entriesToPrint.length >= lastNentriesToPrint) {
            entriesToPrint = _.takeRight(entriesToPrint, lastNentriesToPrint);
        }
    }

    _.forEach(entriesToPrint, function (entry) {
        var amoment = moment(entry.timestamp);
        var displayMoment = amoment.format('dddd MMMM Do YYYY, h:mm:ss a');
        var displayId = (entry.id.toString());
        console.log("%s\n%s %s\n", displayMoment.blue.bold, displayId.green.bold, entry.text);
    });

    console.log("total: %s\n", entriesToPrint.length.toString().yellow);
};

var search = function (regExpStr) {
    var flags = 'ig'; // case-insensitive, global
    var regExp = new RegExp(regExpStr, flags);

    var matchedEntries = _.filter(entries, function (entry) {
        return regExp.test(entry.text);
    });

    // add colored highlights for matches
    var coloredEntries = _.map(matchedEntries, function (entry) {
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

        _.forEach(wordMatches, function (wordMatch) {
            entry.text = entry.text.replace(regExp, wordMatch.underline.yellow);
        });

        return entry;
    });

    print(coloredEntries);
};

if (argv.write) {
    init(argv.write);
    write();
} else if (argv.print) {
    init(argv.print);
    if (argv._.length > 0) {
        var lastNentriesToPrint = argv._[0];
        print(entries, lastNentriesToPrint);
    } else {
        print(entries);
    }
} else if (argv.search) {
    init(argv.search);
    if (argv._.length > 0) {
        var searchText = argv._[0];
        search(searchText);
    }
}
