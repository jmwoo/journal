import { getJournal } from './journal'
import { PrintDirection } from './types'
import yargs from 'yargs'

(async () => {
	const args = await yargs(process.argv.slice(2))
		.options({
			journal: { type: 'string', default: 'main', alias: 'j' },
			write: { type: 'boolean', default: false, alias: 'w' },
			print: { type: 'boolean', default: false, alias: 'p' },
			search: { type: 'string', default: '', alias: 's' },
			first: { type: 'number', alias: 'f' },
			last: { type: 'number', alias: 'l' }
		}).parse()

	if ([args.print, args.write, args.search != ''].every(arg => !arg)) {
		return
	}

	const journal = await getJournal(args.journal)

	if (args.print) {
		journal.print({
			printDirection: args.first ? PrintDirection.First : PrintDirection.Last,
			amount: args.first || args.last || Number.MAX_SAFE_INTEGER
		})
	} else if (args.search.trim() != '') {
		journal.search(args.search)
	} else if (args.write) {
		await journal.write()
	}
})()
