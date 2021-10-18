import { writeFile, readFile, access, mkdir } from 'fs/promises'
import { join as pathJoin } from 'path'
import { Entry, JournalArguments, PrintDirection, PrintOptions } from './types'
import colors from 'colors'
import moment from 'moment'
import { take, takeRight } from 'lodash'

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
	} catch (error) {}

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
			const aMoment = moment(entry.timestamp)
			const displayMoment = aMoment.format('dddd MMMM Do YYYY, h:mm:ss a')
			console.log(`${displayMoment.blue.bold}\n${entry.id.toString().green.bold} ${entry.text}\n`)
		}
		console.log(`total: ${entries.length.toString().yellow}\n`)
	}

	public print(options: PrintOptions) {
		const takeFunction = options.printDirection == PrintDirection.Front ? take : takeRight
		const entriesToPrint = takeFunction(this.entries, options.amount)
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
