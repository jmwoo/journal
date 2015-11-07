# journal

This is a simple journaling application that stores entries in JSON.

## usage

### write entries

    node journal.js -w {journal}

### print entries, (optional: only print last N entries)

    node journal.js -p {journal} {lastN}

### search for entries given a regular expression

    node journal.js -s {journal} {regex}