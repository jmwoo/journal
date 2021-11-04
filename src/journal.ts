import { writeFile, readFile, mkdir } from 'fs/promises'
import { join as pathJoin } from 'path'
import chalk from 'chalk'
import { Entry, IOutput, JournalArguments, PrintDirection, PrintOptions } from './types'
import { fileExists } from './util'
import readline from 'readline'
import { getMetrics } from './metrics'
import { getDateService, IDateService } from './dateservice'

export async function getJournal(journalName: string): Promise<IJournal> {
	const getJournalName = () => journalName
	const directoryName = pathJoin(__dirname, '../entries')
	const pathName = pathJoin(directoryName, `${getJournalName()}.json`)
	const saveToFile = (entries: Entry[]) => writeFile(pathName, JSON.stringify(entries))
	let initEntries: Entry[] = []

	await mkdir(directoryName, { recursive: true })

	if (await fileExists(pathName)) {
		initEntries = JSON.parse(await readFile(pathName, { encoding: 'utf8' }))
	}

	const output: IOutput = {
		log: console.log,
		error: console.error
	}

	const dateService = getDateService()

	return new Journal({
		getJournalName: getJournalName,
		saveToFile: saveToFile,
		entries: initEntries,
		output: output,
		useColors: true,
		dateService: dateService,
		printSet: getPrintSet(getJournalName(), dateService, output)
	})
}

const getPrintSet = (journalName: string, dateService: IDateService, output: IOutput) => {
	return (entries: Entry[]) => {
		output.log(`'${chalk.bold(journalName)}'\n`)
		for (const entry of entries) {
			const date = dateService.parseTimestamp(entry.timestamp)
			const displayDate = dateService.getDisplayDate(date)
			output.log(
				`${chalk.blue.bold(displayDate)}\n${chalk.green.bold(entry.id)} ${entry.text}\n`
			)
		}
		output.log(`total: ${chalk.yellow(entries.length)}\n`)
	}
}

interface IJournal {
	print(options: PrintOptions): void
	search(regExp: string): void
	write(): Promise<void>
	viewMetrics(): void
}

export class Journal implements IJournal {
	private readonly getJournalName: () => string
	private entries: Entry[]
	private readonly output: IOutput
	private readonly saveToFile: (entries: Entry[]) => Promise<void>
	private readonly isColorsEnabled: boolean
	private readonly dateService: IDateService
	private readonly printSet: (entries: Entry[]) => void

	constructor(args: JournalArguments) {
		this.getJournalName = args.getJournalName
		this.entries = args.entries
		this.saveToFile = args.saveToFile
		this.output = args.output
		this.isColorsEnabled = args.useColors
		if (!this.isColorsEnabled) {
			chalk.level = 0
		}
		this.dateService = args.dateService
		this.printSet = args.printSet
	}

	public print(options: PrintOptions): void {
		const take =
			options.printDirection == PrintDirection.First
				? (e: Entry[]) => e.slice(0, options.amount)
				: (e: Entry[]) => e.slice(-options.amount)
		const entriesToPrint = take(this.entries)
		this.printSet(entriesToPrint)
	}

	public search(regExpStr: string): void {
		const getRegex = () => new RegExp(regExpStr, 'ig')
		let regex = getRegex()

		let matchedEntries = this.entries.filter(entry => regex.test(entry.text))

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
					entry.text = entry.text.replace(regex, chalk.yellow.underline(wordMatch))
				}
				return entry
			})
		}
		this.printSet(matchedEntries)
	}

	public async write(): Promise<void> {
		const rl = readline.createInterface(process.stdin, process.stdout)
		const setPrompt = () => {
			rl.setPrompt(`${chalk.green.bold(this.getNextId())} >>> `)
			rl.prompt()
		}
		rl.on('line', async line => {
			line = line.trim()
			if (line != '') {
				await this.addEntry(line)
			}
			setPrompt()
		})
		this.output.log(`'${chalk.bold(this.getJournalName())}'`)
		setPrompt()
	}

	public getNextId(): number {
		if (this.entries.length == 0) {
			return 1
		}
		const lastEntry = this.entries[this.entries.length - 1]
		return lastEntry.id + 1
	}

	public async addEntry(text: string): Promise<void> {
		if (!text || text.trim() == '') {
			this.output.error('entry text invalid')
			return
		}
		this.entries.push({
			text: text.trim(),
			timestamp: this.dateService.makeTimestamp(),
			id: this.getNextId()
		})
		await this.saveToFile(this.entries)
	}

	public viewMetrics(): void {
		const metrics = getMetrics(this.entries)
		this.output.log(`metrics loaded but printing is not implemented`)
		// TODO: output metrics
	}
}
