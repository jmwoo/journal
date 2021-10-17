"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var moment_1 = __importDefault(require("moment"));
var colors_1 = __importDefault(require("colors"));
var mkdirp = require("mkdirp");
var lodash_1 = __importDefault(require("lodash"));
var readline = require("readline");
var path = require("path");
var fs = require("fs");
var argv = require('optimist')
    .alias('w', 'write')
    .alias('p', 'print')
    .alias('s', 'search')
    .alias('f', 'first')
    .alias('l', 'last')
    .argv;
colors_1.default.enable();
var journalName;
var journalFileName;
var entries;
var momentFormat = 'dddd MMMM Do YYYY, h:mm:ss a';
var init = function () {
    journalName = argv.write || argv.print || argv.search || -1;
    if (!lodash_1.default.isString(journalName)) {
        journalName = 'main';
    }
    var journalDir = path.join(__dirname, 'entries');
    mkdirp.sync(journalDir);
    journalFileName = path.join(journalDir, journalName + '.json');
    entries = [];
    if (fs.existsSync(journalFileName)) {
        entries = JSON.parse(fs.readFileSync(journalFileName).toString());
    }
};
var saveToFile = function () {
    fs.writeFile(journalFileName, JSON.stringify(entries), function (error) {
        if (error) {
            throw error;
        }
    });
};
var printSet = function (entriesToPrint) {
    console.log("\n'" + journalName + "'\n");
    for (var _i = 0, entriesToPrint_1 = entriesToPrint; _i < entriesToPrint_1.length; _i++) {
        var entry = entriesToPrint_1[_i];
        var amoment = moment_1.default(entry.timestamp);
        var displayMoment = amoment.format(momentFormat);
        var displayId = (entry.id.toString());
        console.log("%s\n%s %s\n", displayMoment.blue.bold, displayId.green.bold, entry.text);
    }
    console.log("total: %s\n", entriesToPrint.length.toString().yellow);
};
var write = function () {
    var rl = readline.createInterface(process.stdin, process.stdout);
    var id = entries.length + 1;
    var prompt = "'" + journalName + "' " + "(" + id.toString() + ") " + ">>> ";
    rl.setPrompt(prompt);
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
        id = entries.length + 1;
        prompt = '(' + id.toString() + ') ' + '>>> ';
        rl.setPrompt(prompt);
        rl.prompt();
    });
};
var print = function () {
    var entriesToPrint = entries;
    // if a 'first' or 'last' argument is passed, parse and limit accordingly
    if (argv.first || argv.last) {
        var limit = argv.first || argv.last;
        if (lodash_1.default.isNumber(limit) && entriesToPrint.length >= limit) {
            var take = argv.first ? lodash_1.default.take : lodash_1.default.takeRight;
            entriesToPrint = take(entriesToPrint, limit);
        }
    }
    printSet(entriesToPrint);
};
var search = function (regExpStr) {
    var flags = 'ig'; // case-insensitive, global
    var regExp = new RegExp(regExpStr, flags);
    var matchedEntries = lodash_1.default.filter(entries, function (entry) {
        return regExp.test(entry.text);
    });
    // add colored highlights for matches
    var coloredEntries = lodash_1.default.map(matchedEntries, function (entry) {
        regExp = new RegExp(regExpStr, flags); // have to reinitialize regexp here
        var wordMatches = [];
        var match;
        while (true) {
            match = regExp.exec(entry.text);
            if (match) {
                wordMatches.push(match[0]);
            }
            else {
                break;
            }
        }
        for (var _i = 0, wordMatches_1 = wordMatches; _i < wordMatches_1.length; _i++) {
            var wordMatch = wordMatches_1[_i];
            entry.text = entry.text.replace(regExp, wordMatch.underline.yellow);
        }
        return entry;
    });
    printSet(coloredEntries);
};
init();
if (argv.write) {
    write();
}
else if (argv.print) {
    print();
}
else if (argv.search) {
    if (argv._.length > 0) {
        var searchText = argv._[0];
        search(searchText);
    }
}
