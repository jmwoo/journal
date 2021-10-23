import { writeFile, readFile, mkdir } from 'fs/promises'
import { join as pathJoin } from 'path'
import colors from 'colors'
import { parseISO as dateParseISO, format as dateFormat } from 'date-fns'
import { Entry, JournalArguments, PrintDirection, PrintOptions } from './types'
import { fileExists } from './util'
import readline from 'readline'

export async function getJournal(journalName: string): Promise<IJournal> {
	const directoryName = pathJoin(__dirname, '../entries')
	const pathName = pathJoin(directoryName, `${journalName}.json`)
	let entries: Entry[] = []

	await mkdir(directoryName, { recursive: true })

	if (await fileExists(pathName)) {
		entries = JSON.parse(await readFile(pathName, {encoding: 'utf8'}))
	}

	return new Journal({
		journalName: journalName,
		directoryName: directoryName,
		pathName: pathName,
		entries: entries,
		output: console.log,
		errorput: console.error,
		useColors: true
	})
}

interface IJournal {
	print(options: PrintOptions): void
	search(regExp: string): void
	write(): Promise<void>
}

class Journal implements IJournal {
	private journalName: string
	private pathName: string
	private entries: Entry[]
	private output: (msg: string) => void
	private errorput: (msg: string) => void

	constructor(args: JournalArguments) {
		this.journalName = args.journalName
		this.pathName = args.pathName
		this.entries = args.entries
		this.output = args.output
		this.errorput = args.errorput
		args.useColors ? colors.enable() : colors.disable()
	}

	public print(options: PrintOptions): void {
		const take = PrintDirection.First ?
			(e: Entry[]) => e.slice(0, options.amount) :
			(e: Entry[]) => e.slice(-options.amount)
		const entriesToPrint = take(this.entries)
		this.printSet(entriesToPrint)
	}

	public search(regExpStr: string): void {
		const getRegex = () => new RegExp(regExpStr, 'ig')
		let regex = getRegex()

		const matchedEntries = this.entries
			.filter(entry => regex.test(entry.text))
			.map(entry => {
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
		this.printSet(matchedEntries)
	}

	public async write(): Promise<void> {
		const rl = readline.createInterface(process.stdin, process.stdout)
		const setPrompt = () => {
			rl.setPrompt(`${this.getNextId().toString().green.bold} >>> `)
			rl.prompt()
		}
		rl.on('line', async (text) => {
			text = text.trim()
			if (text != '') {
				await this.addEntry(text)
			}
			setPrompt()
		})
		this.output(`'${this.journalName.bold}'`)
		setPrompt()
	}

	private getNextId(): number {
		if (this.entries.length == 0) {
			return 1
		}
		const lastEntry = this.entries[this.entries.length - 1]
		return lastEntry.id + 1
	}

	private async save(): Promise<void> {
		await writeFile(this.pathName, JSON.stringify(this.entries))
	}

	private printSet(entries: Entry[]): void {
		this.output(`'${this.journalName.bold}'\n`)
		for (const entry of entries) {
			const date = dateParseISO(entry.timestamp)
			const displayDate = dateFormat(date, 'EEEE LLLL do yyyy h:mm:ss aaa')
			this.output(`${displayDate.blue.bold}\n${entry.id.toString().green.bold} ${entry.text}\n`)
		}
		this.output(`total: ${entries.length.toString().yellow}\n`)
	}

	private async addEntry(text: string): Promise<void> {
		if (!text || text.trim() == '') {
			this.errorput('entry text invalid')
			return
		}
		this.entries.push({
			text: text.trim(),
			timestamp: new Date().toISOString(),
			id: this.getNextId()
		})
		await this.save()
	}
}
