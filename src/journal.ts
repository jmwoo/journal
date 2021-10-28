import { writeFile, readFile, mkdir } from 'fs/promises'
import { join as pathJoin } from 'path'
import colors from 'colors'
import { Entry, IOutput, JournalArguments, PrintDirection, PrintOptions } from './types'
import { fileExists } from './util'
import readline from 'readline'
import { getMetrics } from './metrics'
import { getDateService, IDateService } from './dateservice'

export async function getJournal(journalName: string): Promise<IJournal> {
	const directoryName = pathJoin(__dirname, '../entries')
	const pathName = pathJoin(directoryName, `${journalName}.json`)
	const saveToFile = (e: Entry[]) => writeFile(pathName, JSON.stringify(e))
	let entries: Entry[] = []

	await mkdir(directoryName, { recursive: true })

	if (await fileExists(pathName)) {
		entries = JSON.parse(await readFile(pathName, { encoding: 'utf8' }))
	}

	return new Journal({
		journalName: journalName,
		saveToFile: saveToFile,
		entries: entries,
		output: {
			log: console.log,
			error: console.error
		},
		useColors: true,
		dateService: getDateService()
	})
}

interface IJournal {
	print(options: PrintOptions): void
	search(regExp: string): void
	write(): Promise<void>
	viewMetrics(): void
}

export class Journal implements IJournal {
	private readonly journalName: string
	private entries: Entry[]
	private readonly output: IOutput
	private readonly saveToFile: (entries: Entry[]) => Promise<void>
	private readonly isColorsEnabled: boolean
	private readonly dateService: IDateService

	constructor(args: JournalArguments) {
		this.journalName = args.journalName
		this.entries = args.entries
		this.saveToFile = args.saveToFile
		this.output = args.output
		this.isColorsEnabled = args.useColors
		this.isColorsEnabled ? colors.enable() : colors.disable()
		this.dateService = args.dateService
	}

	public print(options: PrintOptions): void {
		const take = options.printDirection == PrintDirection.First
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
				const wordMatches: string[] = []
				while (true) {
					const match = regex.exec(entry.text)
					if (match) {
						wordMatches.push(match[0])
					} else {
						break
					}
				}
				for (const wordMatch of wordMatches) {
					entry.text = entry.text.replace(regex, wordMatch.underline.yellow)
				}
				return entry
			})
		}
		this.printSet(matchedEntries)
	}

	public async write(): Promise<void> {
		const rl = readline.createInterface(process.stdin, process.stdout)
		const setPrompt = () => {
			rl.setPrompt(`${this.getNextId().toString().green.bold} >>> `)
			rl.prompt()
		}
		rl.on('line', async text => {
			text = text.trim()
			if (text != '') {
				await this.addEntry(text)
			}
			setPrompt()
		})
		this.output.log(`'${this.journalName.bold}'`)
		setPrompt()
	}

	public getNextId(): number {
		if (this.entries.length == 0) {
			return 1
		}
		const lastEntry = this.entries[this.entries.length - 1]
		return lastEntry.id + 1
	}

	private printSet(entries: Entry[]): void {
		this.output.log(`'${this.journalName.bold}'\n`)
		for (const entry of entries) {
			const date = this.dateService.parseTimestamp(entry.timestamp)
			const displayDate = this.dateService.getDisplayDate(date)
			this.output.log(
				`${displayDate.blue.bold}\n${entry.id.toString().green.bold} ${entry.text}\n`
			)
		}
		this.output.log(`total: ${entries.length.toString().yellow}\n`)
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
