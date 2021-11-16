import { getDatabaseService, IDatabaseService } from '../src/database-service'
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
			log: msg => {},
			error: msg => {}
		},
		printSet: e => {},
		isColorsEnabled: false,
		databaseService: getDefaultDatabaseService()
	}
}

describe('journal.addEntry()', () => {
	test('entry added', () => {
		// const args = getDefaultTestJournalArgs()
		// let output: EntryModel[] = []
		// args.databaseService.createEntry = (journalId: number, text: string, timestamp: Date) => {
		// 	let entry: EntryModel = {journalId, text, timestamp, entryId: -1}
		// 	output.push(entry)
		// 	return Promise.resolve(entry)
		// }
		// const journalService = new JournalService(args)
		// journalService.addEntry('abc ').then(() => {
		// 	const entry = output[0]
		// 	expect(entry.text).toBe('abc')
		// 	expect(entry.entryId).toBe(1)
		// 	expect(entry.timestamp instanceof Date).toBe(true)
		// })
	})

	test('bad entry text', () => {
		// const args = getDefaultTestJournalArgs()
		// const errors: string[] = []
		// args.output.error = msg => errors.push(msg)
		// let output: EntryModel[] = []
		// args.databaseService.createEntry = (journalId: number, text: string, timestamp: Date) => {
		// 	let entry: EntryModel = {journalId, text, timestamp, entryId: -1}
		// 	output.push(entry)
		// 	return Promise.resolve(entry)
		// }
		// const journalService = new JournalService(args)
		// journalService.addEntry('     ').then(() => {
		// 	expect(errors.length == 1).toBe(true)
		// 	expect(output.length == 0).toBe(true)
		// })
	})
})

describe('journal.search()', () => {
	test('search text', () => {
		// const args = getDefaultTestJournalArgs()
		// let output: EntryModel[] = []
		// args.printSet = (e) => output = output.concat(e)
		// const journalService = new JournalService(args)
		// args.databaseService.getEntries = () => {
		// 	const entries: EntryModel[] = [
		// 		{entryId: 1, journalId: 1, text: 'abc', timestamp: new Date()},
		// 		{entryId: 2, journalId: 1, text: 'def', timestamp: new Date()},
		// 		{entryId: 3, journalId: 1, text: 'ghi', timestamp: new Date()}
		// 	]
		// 	return Promise.resolve(entries)
		// }
		// journalService.search('h').then(() => {
		// 	const entry = output[0]
		// 	expect(entry.entryId).toBe(3)
		// })
	})
})

describe('journal.print()', () => {
	test('print all entries', () => {
		// const args = getDefaultTestJournalArgs()
		// let output: EntryModel[] = []
		// args.printSet = (e) => output = output.concat(e)
		// const journalService = new JournalService(args)
		// args.databaseService.getEntries = () => {
		// 	const entries: EntryModel[] = [
		// 		{entryId: 1, journalId: 1, text: 'abc', timestamp: new Date()},
		// 		{entryId: 2, journalId: 1, text: 'def', timestamp: new Date()},
		// 		{entryId: 3, journalId: 1, text: 'ghi', timestamp: new Date()}
		// 	]
		// 	return Promise.resolve(entries)
		// }
		// journalService.print({ direction: Direction.First, amount: Number.MAX_SAFE_INTEGER }).then(() => {
		// 	expect(output.length).toBe(3)
		// 	expect([1, 2, 3].every(i => output.map(e => e.entryId).includes(i))).toBe(true)
		// })
	})

	// TODO: print first entry
	// TODO: print last entry
})
