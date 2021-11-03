import { getDateService } from '../src/dateservice'
import { Journal } from '../src/journal'
import { Entry, JournalArguments, PrintDirection } from '../src/types'
import { parseISO } from 'date-fns'

const getDefaultTestJournalArgs = (): JournalArguments => {
	return {
		getJournalName: () => 'test',
		entries: [],
		saveToFile: e => Promise.resolve(),
		output: {
			log: msg => {},
			error: msg => {}
		},
		useColors: false,
		dateService: getDateService(),
		printSet: e => {}
	}
}

describe('journal.getNextId()', () => {
	test('no entries', () => {
		const args = getDefaultTestJournalArgs()
		args.entries = []
		const journal = new Journal(args)
		expect(journal.getNextId()).toBe(1)
	})

	test('some entries', () => {
		const args = getDefaultTestJournalArgs()
		args.entries = [
			{ id: 1, text: 'abc', timestamp: '2021-10-27T16:56:31.487Z' },
			{ id: 2, text: 'def', timestamp: '2021-10-28T16:56:31.487Z' },
			{ id: 3, text: 'ghi', timestamp: '2021-10-29T16:56:31.487Z' }
		]
		const journal = new Journal(args)
		expect(journal.getNextId()).toBe(4)
	})

	test('out of place id', () => {
		const args = getDefaultTestJournalArgs()
		args.entries = [{ id: 5, text: 'abc', timestamp: '2021-10-27T16:56:31.487Z' }]
		const journal = new Journal(args)
		expect(journal.getNextId()).toBe(6)
	})
})

describe('journal.addEntry()', () => {
	test('entry added', () => {
		const args = getDefaultTestJournalArgs()
		const mockFile: Entry[] = []
		args.saveToFile = es => {
			es.forEach(e => mockFile.push(e))
			return Promise.resolve()
		}

		const journal = new Journal(args)

		journal.addEntry('abc ').then(() => {
			const entry = mockFile[0]
			expect(entry.text).toBe('abc')
			expect(entry.id).toBe(1)
			expect(parseISO(entry.timestamp) instanceof Date).toBe(true)
		})
	})

	test('bad entry text', () => {
		const args = getDefaultTestJournalArgs()
		const errors: string[] = []
		args.output.error = msg => errors.push(msg)
		const journal = new Journal(args)

		journal.addEntry('     ').then(() => {
			expect(args.entries.length == 0).toBe(true)
			expect(errors.length == 1).toBe(true)
		})
	})
})

describe('journal.search()', () => {
	test('search text', () => {
		const args = getDefaultTestJournalArgs()
		const toPrint: Entry[] = []
		args.printSet = es => es.forEach(e => toPrint.push(e))
		args.entries = [
			{ id: 1, text: 'abc', timestamp: '2021-10-26T16:56:31.487Z' },
			{ id: 2, text: 'def', timestamp: '2021-10-27T16:56:31.487Z' },
			{ id: 3, text: 'ghi', timestamp: '2021-10-28T16:56:31.487Z' },
			{ id: 4, text: 'jkl', timestamp: '2021-10-29T16:56:31.487Z' }
		]
		const journal = new Journal(args)

		journal.search('h')

		expect(toPrint.length).toBe(1)
		expect(toPrint[0].id).toBe(3)
	})
})

describe('journal.print()', () => {
	test('print all entries', () => {
		const args = getDefaultTestJournalArgs()
		const toPrint: Entry[] = []
		args.printSet = es => es.forEach(e => toPrint.push(e))
		args.entries = [
			{ id: 1, text: 'abc', timestamp: '2021-10-26T16:56:31.487Z' },
			{ id: 2, text: 'def', timestamp: '2021-10-27T16:56:31.487Z' },
			{ id: 3, text: 'ghi', timestamp: '2021-10-28T16:56:31.487Z' }
		]
		const journal = new Journal(args)
		journal.print({ printDirection: PrintDirection.First, amount: Number.MAX_SAFE_INTEGER })

		expect(toPrint.length).toBe(3)
		expect([1, 2, 3].every(i => toPrint.map(e => e.id).includes(i))).toBe(true)
	})

	test('print first entry', () => {
		const args = getDefaultTestJournalArgs()
		const toPrint: Entry[] = []
		args.printSet = es => es.forEach(e => toPrint.push(e))
		args.entries = [
			{ id: 1, text: 'abc', timestamp: '2021-10-26T16:56:31.487Z' },
			{ id: 2, text: 'def', timestamp: '2021-10-27T16:56:31.487Z' },
			{ id: 3, text: 'ghi', timestamp: '2021-10-28T16:56:31.487Z' }
		]
		const journal = new Journal(args)
		journal.print({ printDirection: PrintDirection.First, amount: 1 })

		expect(toPrint.length).toBe(1)
		expect(toPrint[0].id).toBe(1)
	})

	test('print last entry', () => {
		const args = getDefaultTestJournalArgs()
		const toPrint: Entry[] = []
		args.printSet = es => es.forEach(e => toPrint.push(e))
		args.entries = [
			{ id: 1, text: 'abc', timestamp: '2021-10-26T16:56:31.487Z' },
			{ id: 2, text: 'def', timestamp: '2021-10-27T16:56:31.487Z' },
			{ id: 3, text: 'ghi', timestamp: '2021-10-28T16:56:31.487Z' }
		]
		const journal = new Journal(args)
		journal.print({ printDirection: PrintDirection.Last, amount: 1 })

		expect(toPrint.length).toBe(1)
		expect(toPrint[0].id).toBe(3)
	})
})
