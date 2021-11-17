import { getDatabaseServiceInstance, IDatabaseService } from '../src/database-service'
import { JournalService, JournalServiceArgs } from '../src/journal-service'
import { Direction, EntryModel } from '../src/types'

const getDefaultDatabaseService = (): IDatabaseService => {
	return {
		sync: () => Promise.resolve(0),
		getOrCreateJournal: name => Promise.resolve({ journalId: -1, name }),
		createEntry: (journalId: number, text: string, timestamp: Date) =>
			Promise.resolve({ entryId: -1, journalId, text, timestamp }),
		getNumEntries: () => Promise.resolve(0),
		getEntries: (journalId: number, direction: Direction, amount: number) => Promise.resolve([])
	}
}

const getDefaultTestJournalArgs = (): JournalServiceArgs => {
	return {
		journalId: -1,
		journalName: 'test',
		numEntries: 0,
		output: {
			log: (msg: string) => {},
			error: (msg: string) => {}
		},
		printSet: (entries: EntryModel[]) => {},
		isColorsEnabled: false,
		databaseService: getDefaultDatabaseService()
	}
}

describe('journal.addEntry()', () => {
	test('entry added', async () => {
		const args = getDefaultTestJournalArgs()
		let output: EntryModel[] = []
		args.databaseService.createEntry = (journalId: number, text: string, timestamp: Date) => {
			let entry: EntryModel = { journalId, text, timestamp, entryId: -1 }
			output.push(entry)
			return Promise.resolve(entry)
		}
		const journalService = new JournalService(args)

		await journalService.addEntry('abc ')
		expect(output.length).toBe(1)
		const entry = output[0]
		expect(entry.text).toBe('abc')
		expect(entry.timestamp instanceof Date).toBe(true)
	})

	test('bad entry text', () => {
		const args = getDefaultTestJournalArgs()
		const errors: string[] = []
		args.output.error = msg => errors.push(msg)
		let output: EntryModel[] = []
		args.databaseService.createEntry = async (
			journalId: number,
			text: string,
			timestamp: Date
		) => {
			let entry: EntryModel = { journalId, text, timestamp, entryId: -1 }
			output.push(entry)
			return Promise.resolve(entry)
		}
		const journalService = new JournalService(args)
		journalService.addEntry('     ').then(() => {
			expect(errors.length == 1).toBe(true)
			expect(output.length == 0).toBe(true)
		})
	})
})

describe('journal.search()', () => {
	test('search text', async () => {
		let toPrint: EntryModel[] = []
		const args = getDefaultTestJournalArgs()
		args.databaseService.getEntries = async (
			journalId: number,
			direction: Direction,
			amount: number
		) => {
			const entries: EntryModel[] = [
				{ entryId: 1, journalId: 1, text: 'abc', timestamp: new Date() },
				{ entryId: 2, journalId: 1, text: 'def', timestamp: new Date() },
				{ entryId: 3, journalId: 1, text: 'ghi', timestamp: new Date() }
			]
			return Promise.resolve(entries)
		}
		args.printSet = entries => (toPrint = toPrint.concat(entries))
		const journalService = new JournalService(args)

		await journalService.search('e')
		expect(toPrint.length).toBe(1)
		let entry = toPrint[0]
		expect(entry.entryId).toBe(2)

		toPrint = []
		await journalService.search('^g')
		expect(toPrint.length).toBe(1)
		entry = toPrint[0]
		expect(entry.entryId).toBe(3)
	})
})
