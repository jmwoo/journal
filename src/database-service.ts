import { Sequelize, Model } from 'sequelize'
import { Journal, Entry, initializeModels } from './database-models'
import { JournalModel, EntryModel, Direction } from './types'
import { join as pathJoin } from 'path'

const sequelize = new Sequelize({
	dialect: 'sqlite',
	storage: process.env.DB_STORAGE ?? pathJoin(__dirname, '../data/journal.db'),
	logging: false
})

initializeModels(sequelize)

const toPlain = (model: Model) => {
	return model.get({ plain: true })
}

export interface IDatabaseService {
	sync(): Promise<any>
	getOrCreateJournal(name: string): Promise<JournalModel>
	createEntry(journalId: number, text: string, timestamp: Date): Promise<EntryModel>
	getNumEntries(journalId: number): Promise<number>
	getEntries(journalId: number, direction: Direction, amount: number): Promise<Array<EntryModel>>
}

class DatabaseService implements IDatabaseService {
	async sync(): Promise<any> {
		await sequelize.sync()
	}

	async getOrCreateJournal(name: string): Promise<JournalModel> {
		let journal = await Journal.findOne({
			where: {
				name: name
			}
		})

		if (journal) {
			return toPlain(journal)
		}

		journal = await Journal.create({ name: name })
		return toPlain(journal)
	}

	async createEntry(journalId: number, text: string, timestamp: Date): Promise<EntryModel> {
		const entry = await Entry.create({ journalId, text, timestamp })
		return toPlain(entry)
	}

	async getEntries(
		journalId: number,
		direction: Direction,
		amount: number
	): Promise<Array<EntryModel>> {
		const orderBy = direction == Direction.First ? 'asc' : 'desc'
		const entries = await Entry.findAll({
			where: {
				journalId: journalId
			},
			limit: amount,
			order: [['timestamp', orderBy]]
		})
		const entryModels: EntryModel[] = entries.map(toPlain)
		entryModels.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
		return entryModels
	}

	async getNumEntries(journalId: number): Promise<number> {
		return Entry.count({
			where: {
				journalId: journalId
			}
		})
	}
}

let databaseService: IDatabaseService
export const getDatabaseServiceInstance = (): IDatabaseService => {
	if (!databaseService) {
		databaseService = new DatabaseService()
	}
	return databaseService
}
