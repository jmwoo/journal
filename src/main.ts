import { getJournalService } from './journal-service'
import { Direction } from './types'
import yargs from 'yargs'
;(async () => {
	const args = await yargs(process.argv.slice(2))
		.options({
			journal: { type: 'string', default: 'main', alias: 'j' },
			write: { type: 'boolean', default: false, alias: 'w' },
			print: { type: 'boolean', default: false, alias: 'p' },
			search: { type: 'string', default: '', alias: 's' },
			metrics: { type: 'boolean', default: false, alias: 'm' },
			first: { type: 'number', alias: 'f' },
			last: { type: 'number', alias: 'l' }
		})
		.parse()

	if (
		[args.print, args.write, Boolean(args.search), args.metrics].every((arg: boolean) => !arg)
	) {
		return
	}

	const journal = await getJournalService(args.journal)

	if (args.print) {
		await journal.print({
			direction: args.last ? Direction.Last : Direction.First,
			amount: args.last || args.first || Number.MAX_SAFE_INTEGER
		})
	} else if (args.search.trim() != '') {
		await journal.search(args.search)
	} else if (args.write) {
		await journal.write()
	} else if (args.metrics) {
		// journal.viewMetrics()
		throw new Error('not implemented')
	}
})()
