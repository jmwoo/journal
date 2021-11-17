# journal

A simple journaling application.

## about
I wrote this a long time ago when I was first learning javascript. Suprisingly, I used it a lot so I keep it updated for fun.

## install
    npm install
    npm run build

## write entries

    # default to 'main' journal
    node dist/main.js -w 
    
    # write to 'work' journal
    node dist/main.js -j work -w

## print entries

    # default to 'main' journal
    node dist/main.js -p

    # print 'work' entries
    node dist/main.js -j work -p

    # print first {limit} entries
    node dist/main.js -p -f {limit}

    # print last {limit} entries
    node dist/main.js -l {limit}

## search for entries given a regular expression

    node dist/main.js -s {regex}

    # find entries with the word 'test'
    node dist/main.js -s test

    # find entries that start with 't'
    node dist/main.js -s ^t


you can set a custom path/name for you journal. Just add a `.env` file in the project directory and add a DB_STORAGE value

    DB_STORAGE=/some/path/on/your/computer/journal.db