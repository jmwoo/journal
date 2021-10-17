import moment from 'moment'
import colors from 'colors'
import mkdirp = require('mkdirp')
import _ from 'lodash'
import readline = require('readline')
import path = require('path')
import fs = require('fs')
const argv = require('optimist')
    .alias('w', 'write')
    .alias('p', 'print')
    .alias('s', 'search')
    .alias('f', 'first')
    .alias('l', 'last')
    .argv

colors.enable()

interface Entry {
    id: number,
    timestamp: string,
    text: string
}

let journalName: string
let journalFileName: string
let entries: Entry[]
const momentFormat = 'dddd MMMM Do YYYY, h:mm:ss a'

const init = function () {
    journalName = argv.write || argv.print || argv.search || -1
    if (!_.isString(journalName)) {
        journalName = 'main'
    }
    const journalDir = path.join(__dirname, 'entries')
    mkdirp.sync(journalDir)
    journalFileName = path.join(journalDir, journalName + '.json')
    entries = []
    if (fs.existsSync(journalFileName)) {
        entries = JSON.parse(fs.readFileSync(journalFileName).toString())
    }
}

const saveToFile = function () {
    fs.writeFile(journalFileName, JSON.stringify(entries), (error) => {
        if (error) {
            throw error
        }
    })
}

const printSet = function (entriesToPrint: Entry[]) {
    console.log("\n'"+journalName+"'\n")
    for (const entry of entriesToPrint)
    {
        const amoment = moment(entry.timestamp)
        const displayMoment = amoment.format(momentFormat)
        const displayId = (entry.id.toString())
        console.log("%s\n%s %s\n", displayMoment.blue.bold, displayId.green.bold, entry.text)
    }
    console.log("total: %s\n", entriesToPrint.length.toString().yellow)
}

const write = function () {
    const rl = readline.createInterface(process.stdin, process.stdout)
    const id = entries.length + 1
    let prompt = "'"+journalName+"' "+"("+id.toString()+") "+">>> "
    rl.setPrompt(prompt)
    rl.prompt()
    rl.on('line', (text) => {
        text = text.trim()
        let id = 1
        if (entries.length > 0) {
            id = entries[entries.length - 1].id + 1
        }
        if (text) {
            entries.push({
                timestamp: new Date().toISOString(),
                text: text,
                id: id
            })
            saveToFile()
        }
        id = entries.length + 1
        prompt = '('+id.toString()+') '+'>>> '
        rl.setPrompt(prompt)
        rl.prompt()
    })
}

const print = function () {
    let entriesToPrint = entries

    // if a 'first' or 'last' argument is passed, parse and limit accordingly
    if (argv.first || argv.last) {
        const limit = argv.first || argv.last
        if (_.isNumber(limit) && entriesToPrint.length >= limit) {
            const take = argv.first ? _.take : _.takeRight
            entriesToPrint = take(entriesToPrint, limit)
        }
    }

    printSet(entriesToPrint)
}

const search = function (regExpStr: string) {
    const flags = 'ig' // case-insensitive, global
    let regExp = new RegExp(regExpStr, flags)

    const matchedEntries = _.filter(entries, function (entry: Entry) {
        return regExp.test(entry.text)
    })

    // add colored highlights for matches
    const coloredEntries = _.map(matchedEntries, function (entry: Entry) {
        regExp = new RegExp(regExpStr, flags) // have to reinitialize regexp here

        let wordMatches = []
        let match
        while (true) {
            match = regExp.exec(entry.text)
            if (match) {
                wordMatches.push(match[0])
            } else {
                break
            }
        }

        for (const wordMatch of wordMatches) {
            entry.text = entry.text.replace(regExp, wordMatch.underline.yellow)
        }

        return entry
    })

    printSet(coloredEntries)
}

init()
if (argv.write) {
    write()
} else if (argv.print) {
    print()
} else if (argv.search) {
    if (argv._.length > 0) {
        const searchText = argv._[0]
        search(searchText)
    }
}
