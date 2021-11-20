import { getDatabaseServiceInstance, IDatabaseService } from './database-service'
import { Direction, EntryModel, IOutput, PrintOptions } from './types'
import readline from 'readline'
import chalk from 'chalk'
import { format as dateFormat } from 'date-fns'

export async function getJournalService(journalName: string): Promise<IJournalService> {
	const databaseService = getDatabaseServiceInstance()
	await databaseService.sync()
	const journal = await databaseService.getOrCreateJournal(journalName)
	const numEntries = await databaseService.getNumEntries(journal.journalId)
	const output = getOutput()
	const printSet = getPrintSet(journalName, output)
	return new JournalService({
		journalId: journal.journalId,
		journalName: journal.name,
		printSet: printSet,
		numEntries: numEntries,
		output: output,
		isColorsEnabled: true,
		databaseService: databaseService
	})
}

const getPrintSet = (journalName: string, output: IOutput) => {
	return (entries: EntryModel[]) => {
		output.log(`'${chalk.bold(journalName)}'\n`)
		for (const entry of entries) {
			const displayDate = dateFormat(entry.timestamp, 'EEEE LLLL do yyyy h:mm:ss aaa')
			output.log(
				`${chalk.blue.bold(displayDate)}\n${chalk.green.bold(entry.entryId)} ${
					entry.text
				}\n`
			)
		}
		output.log(`total: ${chalk.yellow(entries.length)}\n`)
	}
}

const getOutput = (): IOutput => {
	return {
		log: console.log,
		error: console.error
	}
}

export interface JournalServiceArgs {
	journalId: number
	journalName: string
	numEntries: number
	printSet: (entries: EntryModel[]) => void
	output: IOutput
	isColorsEnabled: boolean
	databaseService: IDatabaseService
}

export interface IJournalService {
	write(): Promise<void>
	print(options: PrintOptions): Promise<void>
	search(regexStr: string): Promise<void>
}

export class JournalService {
	private readonly journalId: number
	private readonly journalName: string
	private readonly printSet: (entries: EntryModel[]) => void
	private numEntries: number
	readonly output: IOutput
	private readonly isColorsEnabled: boolean
	private readonly databaseService: IDatabaseService

	constructor(args: JournalServiceArgs) {
		this.journalId = args.journalId
		this.journalName = args.journalName
		this.printSet = args.printSet
		this.numEntries = args.numEntries
		this.output = args.output
		this.isColorsEnabled = args.isColorsEnabled
		if (!this.isColorsEnabled) {
			chalk.level = 0
		}
		this.databaseService = args.databaseService
	}

	public async addEntry(text: string): Promise<void> {
		if (!text || text.trim() == '') {
			this.output.error('entry text invalid')
			return
		}
		await this.databaseService.createEntry(this.journalId, text.trim(), new Date())
		this.numEntries += 1
	}

	public async write(): Promise<void> {
		const rl = readline.createInterface(process.stdin, process.stdout)
		const setPrompt = () => {
			rl.setPrompt(`${chalk.green.bold(this.numEntries + 1)} >>> `)
			rl.prompt()
		}
		rl.on('line', async line => {
			line = line.trim()
			if (line != '') {
				await this.addEntry(line)
			}
			setPrompt()
		})
		this.output.log(`'${chalk.bold(this.journalName)}'`)
		setPrompt()
	}

	public async print(options: PrintOptions): Promise<void> {
		const entries = await this.databaseService.getEntries(
			this.journalId,
			options.direction,
			options.amount
		)
		this.printSet(entries)
	}

	public async search(regexStr: string): Promise<void> {
		// TODO: pass regex to sqlite instead of reading all entries into memory if possible
		const entries = await this.databaseService.getAllEntries(this.journalId)

		const getRegex = () => new RegExp(regexStr, 'ig')
		let regex = getRegex()

		let matchedEntries = entries.filter(entry => regex.test(entry.text))

		if (this.isColorsEnabled) {
			matchedEntries = matchedEntries.map(entry => {
				// add colored highlights for matches
				regex = getRegex()
				const wordMatches: Set<string> = new Set()
				while (true) {
					const match = regex.exec(entry.text)
					if (match) {
						wordMatches.add(match[0])
					} else {
						break
					}
				}
				for (const wordMatch of wordMatches) {
					entry.text = entry.text.replace(wordMatch, chalk.yellow.underline(wordMatch))
				}
				return entry
			})
		}
		this.printSet(matchedEntries)
	}
}
