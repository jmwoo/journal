# journal

This is a simple journaling application that stores entries in JSON.

## usage

### write entries

    node journal.js -w {journalName}

### print entries

    node journal.js -p {journalName}

    node journal.js -p {journalName} -f {limit} // print first N entries

    node journal.js -p {journalName} -l {limit} // print last N entries

### search for entries given a regular expression

    node journal.js -s {journalName} {regex}