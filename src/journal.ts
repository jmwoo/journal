import { writeFile, readFile, access, mkdir } from 'fs/promises'
import { join as pathJoin } from 'path'
import { Entry, JournalArguments, PrintDirection, PrintOptions } from './types'
import colors from 'colors'
import { parseISO as dateParseISO, format as dateFormat } from 'date-fns'

colors.enable()

export async function getJournal(journalName: string): Promise<IJournal> {
	const directoryName = pathJoin(__dirname, '../entries')
	const pathName = pathJoin(directoryName, `${journalName}.json`)
	let entries: Entry[] = []

	await mkdir(directoryName, { recursive: true })

	try {
		await access(pathName)
		const buffer = await readFile(pathName)
		entries = JSON.parse(buffer.toString())
	} catch (error) { }

	return new Journal({
		journalName: journalName,
		directoryName: directoryName,
		pathName: pathName,
		entries: entries
	})
}

interface IJournal {
	save(): Promise<void>
	print(options: PrintOptions): void
	search(regExp: string): void
	addEntry(text: string): Promise<void>
	getNextId(): number
	getName(): string
}

class Journal implements IJournal {
	private journalName: string
	private pathName: string
	private entries: Entry[]

	constructor(args: JournalArguments) {
		this.journalName = args.journalName
		this.pathName = args.pathName
		this.entries = args.entries
	}
	public getName(): string {
		return this.journalName
	}
	public getNextId(): number {
		return this.entries.length + 1
	}

	public async save() {
		await writeFile(this.pathName, JSON.stringify(this.entries))
	}

	private printSet(entries: Entry[]) {
		console.log(`'${this.journalName.bold}'\n`)
		for (const entry of entries) {
			const date = dateParseISO(entry.timestamp)
			const displayDate = dateFormat(date, 'EEEE LLLL do yyyy h:mm:ss aaa')
			console.log(`${displayDate.blue.bold}\n${entry.id.toString().green.bold} ${entry.text}\n`)
		}
		console.log(`total: ${entries.length.toString().yellow}\n`)
	}

	public print(options: PrintOptions) {
		let entriesToPrint: Entry[] = []
		if (options.printDirection == PrintDirection.First) {
			entriesToPrint = this.entries.slice(0, options.amount)
		} else if (options.printDirection == PrintDirection.Last) {
			entriesToPrint = this.entries.slice(-options.amount)
		}
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

	async addEntry(text: string): Promise<void> {
		if (text == null || text.trim() == '') {
			console.log('entry text invalid')
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
