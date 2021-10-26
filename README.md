# journal

This is a simple journaling application that stores entries in JSON.

## about
I wrote this a long time ago when I was first learning javascript. Suprisingly, I used it a lot. So I keep it updated for fun, most recent update is a move to typescript.

## usage
npm install
npm run build

### write entries

    <!-- default to 'main' journal -->
    node dist/main.js -w 
    
    <!-- write to 'work' journal -->
    node dist/main.js -j work -w

### print entries

    <!-- default to 'main' journal -->
    node dist/main.js -p

    <!-- print 'work' entries -->
    node dist/main.js -j work -p

    node dist/main.js -p -f {limit} // print first {limit} entries

    node dist/main.js -l {limit} // print last {limit} entries

### search for entries given a regular expression

    node dist/main.js -s {regex}

    node dist/main.js -j work -s {regex}


## TODO:
- fix the formatting of the readme
- add tests
