import { writeFile, readFile, access, mkdir } from 'fs/promises'
import { join as pathJoin } from 'path'
import colors from 'colors'
import { parseISO as dateParseISO, format as dateFormat } from 'date-fns'
import { Entry, JournalArguments, PrintDirection, PrintOptions } from './types'
import { fileExists } from './util'
import readline from 'readline'

colors.enable()

export async function getJournal(journalName: string): Promise<IJournal> {
	const directoryName = pathJoin(__dirname, '../entries')
	const pathName = pathJoin(directoryName, `${journalName}.json`)
	let entries: Entry[] = []

	await mkdir(directoryName, { recursive: true })

	if (await fileExists(pathName)) {
		const buffer = await readFile(pathName)
		entries = JSON.parse(buffer.toString())
	}

	return new Journal({
		journalName: journalName,
		directoryName: directoryName,
		pathName: pathName,
		entries: entries
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

	constructor(args: JournalArguments) {
		this.journalName = args.journalName
		this.pathName = args.pathName
		this.entries = args.entries
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
			rl.setPrompt(`'${this.journalName}' (${this.getNextId()}) >>> `)
			rl.prompt()
		}
		rl.on('line', async (text) => {
			text = text.trim()
			if (text != '') {
				await this.addEntry(text)
			}
			setPrompt()
		})
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
		console.log(`'${this.journalName.bold}'\n`)
		for (const entry of entries) {
			const date = dateParseISO(entry.timestamp)
			const displayDate = dateFormat(date, 'EEEE LLLL do yyyy h:mm:ss aaa')
			console.log(`${displayDate.blue.bold}\n${entry.id.toString().green.bold} ${entry.text}\n`)
		}
		console.log(`total: ${entries.length.toString().yellow}\n`)
	}
	
	private async addEntry(text: string): Promise<void> {
		if (!text || text.trim() == '') {
			console.error('entry text invalid')
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
