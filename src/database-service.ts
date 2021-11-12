import { Sequelize, Model, DataTypes, Op } from 'sequelize'
import { Journal, Entry, initializeModels } from './database-models'
import { JournalModel, EntryModel, Direction } from './types'

const sequelize = new Sequelize({
	dialect: 'sqlite',
	storage: 'data/journal.db',
	logging: false
})

initializeModels(sequelize)

const toPlain = (model: Model) => {
	return model.get({ plain: true })
}

export interface IDatabaseService {
	sync(): Promise<any>
	createOrGetJournal(name: string): Promise<JournalModel>
	createEntry(journalId: number, text: string, timestamp: Date): Promise<EntryModel>
	getNumEntries(journalId: number): Promise<number>
	getEntries(journalId: number, direction: Direction, amount: number): Promise<Array<EntryModel>>
}

class DatabaseService implements IDatabaseService {
	async sync(): Promise<any> {
		await sequelize.sync()
	}

	async createOrGetJournal(name: string): Promise<JournalModel> {
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
		return entries.map(toPlain)
	}

	async getNumEntries(journalId: number): Promise<number> {
		return Entry.count({
			where: {
				journalId: journalId
			}
		})
	}
}

export const getDatabaseService = (): IDatabaseService => {
	return new DatabaseService()
}
