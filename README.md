# journal

This is a simple journaling application that stores entries in JSON.

## usage

### write entries

    <!-- default to 'main' journal -->
    node journal.js -w 
    
    <!-- write to 'work' journal -->
    node journal.js -j work -w

### print entries

    <!-- default to 'main' journal -->
    node journal.js -p

    <!-- print 'work' entries -->
    node journal.js -j work -p

    node journal.js -p -f {limit} // print first N entries

    node journal.js -l {limit} // print last N entries

### search for entries given a regular expression

    node journal.js -s {regex}

    node journal.js -j work -s {regex}