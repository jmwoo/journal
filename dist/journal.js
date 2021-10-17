"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const moment_1 = __importDefault(require("moment"));
const colors_1 = __importDefault(require("colors"));
const mkdirp = require("mkdirp");
const lodash_1 = require("lodash");
const readline = require("readline");
const path = require("path");
const fs = require("fs");
const argv = require('optimist')
    .alias('j', 'journal')
    .alias('w', 'write')
    .alias('p', 'print')
    .alias('s', 'search')
    .alias('f', 'first')
    .alias('l', 'last')
    .argv;
colors_1.default.enable();
let journalName;
let journalFileName;
let entries;
const momentFormat = 'dddd MMMM Do YYYY, h:mm:ss a';
const init = () => {
    journalName = argv.journal;
    if (!lodash_1.isString(journalName)) {
        journalName = 'main';
    }
    const journalDir = path.join(__dirname, '../entries');
    mkdirp.sync(journalDir);
    journalFileName = path.join(journalDir, journalName + '.json');
    entries = [];
    if (fs.existsSync(journalFileName)) {
        entries = JSON.parse(fs.readFileSync(journalFileName).toString());
    }
};
const saveToFile = () => {
    fs.writeFile(journalFileName, JSON.stringify(entries), (error) => {
        if (error) {
            throw error;
        }
    });
};
const printSet = (entriesToPrint) => {
    console.log("\n'" + journalName + "'\n");
    for (const entry of entriesToPrint) {
        const amoment = moment_1.default(entry.timestamp);
        const displayMoment = amoment.format(momentFormat);
        const displayId = (entry.id.toString());
        console.log("%s\n%s %s\n", displayMoment.blue.bold, displayId.green.bold, entry.text);
    }
    console.log("total: %s\n", entriesToPrint.length.toString().yellow);
};
const write = () => {
    const rl = readline.createInterface(process.stdin, process.stdout);
    const id = entries.length + 1;
    let prompt = "'" + journalName + "' " + "(" + id.toString() + ") " + ">>> ";
    rl.setPrompt(prompt);
    rl.prompt();
    rl.on('line', (text) => {
        text = text.trim();
        let id = 1;
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
const print = () => {
    let entriesToPrint = entries;
    // if a 'first' or 'last' argument is passed, parse and limit accordingly
    if (argv.first || argv.last) {
        const limit = argv.first || argv.last;
        if (lodash_1.isNumber(limit) && entriesToPrint.length >= limit) {
            const takeFunction = argv.first ? lodash_1.take : lodash_1.takeRight;
            entriesToPrint = takeFunction(entriesToPrint, limit);
        }
    }
    printSet(entriesToPrint);
};
const search = (regExpStr) => {
    const flags = 'ig'; // case-insensitive, global
    let regExp = new RegExp(regExpStr, flags);
    const matchedEntries = entries.filter(entry => regExp.test(entry.text));
    // add colored highlights for matches
    const coloredEntries = matchedEntries.map(entry => {
        regExp = new RegExp(regExpStr, flags); // have to reinitialize regexp here
        let wordMatches = [];
        let match;
        while (true) {
            match = regExp.exec(entry.text);
            if (match) {
                wordMatches.push(match[0]);
            }
            else {
                break;
            }
        }
        for (const wordMatch of wordMatches) {
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
    const searchText = argv.search;
    if (searchText != null && lodash_1.isString(searchText) && searchText.trim() != '') {
        search(searchText);
    }
}
