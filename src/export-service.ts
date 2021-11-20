import fs from 'fs/promises'
import path from 'path'
import { getDatabaseServiceInstance } from './database-service'

export async function exportAll(exportDirectoryPath: string): Promise<void> {
	const databaseService = getDatabaseServiceInstance()
	const journals = await databaseService.getJournals()

	for (const journal of journals) {
		const filepath = path.join(exportDirectoryPath, `${journal.name}.json`)
		process.stdout.write(`exporting '${journal.name}' to '${filepath}'...`)
		const entries = await databaseService.getAllEntries(journal.journalId)
		const dataToWrite = JSON.stringify(entries)
		await fs.writeFile(filepath, dataToWrite)
		console.log(' done.')
	}
}
