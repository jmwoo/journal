import { writeFile, readFile, access, mkdir } from 'fs/promises'
import path from 'path'
import { Entry, JouralArguments, PrintDirection, PrintOptions } from './types'
import colors from 'colors'
import moment from 'moment'
import { take, takeRight } from 'lodash'

colors.enable()

interface Journal {
	save(): Promise<void>
	print(options: PrintOptions): void
	search(regExp: string): void
	addEntry(text: string): Promise<void>
	getNextId(): number
	getName(): string
}

export async function getJournal(journalName: string): Promise<Journal> {
	const directoryName = path.join(__dirname, '../entries')
	const pathName = path.join(directoryName, `${journalName}.json`)
	let entries: Entry[] = []

	await mkdir(directoryName, { recursive: true })

	try {
		await access(pathName)
		const buffer = await readFile(pathName)
		entries = JSON.parse(buffer.toString())
	} catch (error) {}

	return new JournalImpl({
		journalName: journalName,
		directoryName: directoryName,
		pathName: pathName,
		entries: entries
	})
}

class JournalImpl implements Journal {
	private journalName: string
	private pathName: string
	private entries: Entry[]

	constructor(args: JouralArguments) {
		this.journalName = args.journalName
		this.pathName = args.pathName
		this.entries = args.entries
	}
	getName(): string {
		return this.journalName;
	}
	public getNextId(): number {
		return this.entries.length + 1
	}

	public async save() {
		await writeFile(this.pathName, JSON.stringify(this.entries))
	}

	private printSet(entries: Entry[]) {
		console.log(`\n${this.journalName}\n`)
		for (const entry of entries) {
			const aMoment = moment(entry.timestamp)
			const displayMoment = aMoment.format('dddd MMMM Do YYYY, h:mm:ss a')
			console.log("%s\n%s %s\n", displayMoment.blue.bold, entry.id.toString().green.bold, entry.text)
		}
		console.log("total: %s\n", entries.length.toString().yellow)
	}

	public print(options: PrintOptions) {
		let entriesToPrint = this.entries
		const takeFunction = options.printDirection == PrintDirection.Front ? take : takeRight
		entriesToPrint = takeFunction(entriesToPrint, options.amount)
		this.printSet(entriesToPrint)
	}
	
	search(regExpStr: string): void {
		const getRegex = () => new RegExp(regExpStr, 'ig')
		let regex = getRegex()

		const matchedEntries = this.entries
			.filter(entry => regex.test(entry.text))
			.map(entry => {
				// add colored highlights for matches
				regex = getRegex()
				const wordMatches: string[] = []
				let match: RegExpExecArray | null = null
				while (true) {
					match = regex.exec(entry.text)
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
