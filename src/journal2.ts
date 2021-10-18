import { writeFile, readFile, access, mkdir } from 'fs/promises'
import path from 'path'
import { Entry, JouralArgs } from './types'
import colors from 'colors'
import moment from 'moment'

colors.enable()

export class Journal {
	private journalName: string
	private pathName: string
	private entries: Entry[]

	private constructor(args: JouralArgs) {
		this.journalName = args.journalName
		this.pathName = args.pathName
		this.entries = args.entries
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

	public print() {
		this.printSet(this.entries)
	}

	public static async create(journalName: string): Promise<Journal> {
		const directoryName = path.join(__dirname, '../entries')
		const pathName = path.join(directoryName, `${journalName}.json`)
		let entries: Entry[] = []

		await mkdir(directoryName, {recursive: true})

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
}
