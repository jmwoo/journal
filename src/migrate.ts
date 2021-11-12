import { writeFile, readFile, mkdir } from 'fs/promises'
import { join as pathJoin } from 'path'
import chalk from 'chalk'
import { Entry, IOutput, JournalArguments, Direction, PrintOptions, EntryModel } from './types'
import { fileExists } from './util'
import readline from 'readline'
import { getMetrics } from './metrics'
import { getDateService, IDateService } from './dateservice'
import { parseISO as dateParseISO, format as dateFormat } from 'date-fns'
import { getDatabaseService } from './database-service'
import { stdout } from 'process'

export async function migrate(journalName: string) {
	const directoryName = pathJoin(__dirname, '../entries')
	const pathName = pathJoin(directoryName, `${journalName}.json`)
	const entries: Entry[] = JSON.parse(await readFile(pathName, { encoding: 'utf8' }))

	const databaseService = getDatabaseService()

	await databaseService.sync()

	const journal = await databaseService.createOrGetJournal(journalName)

	for (const entry of entries) {
		stdout.write(`saving entry ${entry.id}...`)
		const newEntry = await databaseService.createEntry(
			journal.journalId,
			entry.text,
			dateParseISO(entry.timestamp)
		)
		console.log('done')
	}
}
