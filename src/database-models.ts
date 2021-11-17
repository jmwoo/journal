import { Sequelize, Model, DataTypes } from 'sequelize'

export class Journal extends Model {}
export class Entry extends Model {}

export function initializeModels(sequelize: Sequelize) {
	Journal.init(
		{
			journalId: {
				type: DataTypes.INTEGER,
				autoIncrement: true,
				primaryKey: true,
				allowNull: false,
				unique: true
			},
			name: {
				type: DataTypes.STRING,
				allowNull: false,
				unique: true
			}
		},
		{ sequelize, modelName: 'journal' }
	)

	Entry.init(
		{
			entryId: {
				type: DataTypes.INTEGER,
				autoIncrement: true,
				primaryKey: true,
				allowNull: false,
				unique: true
			},
			journalId: {
				type: DataTypes.INTEGER,
				allowNull: false
			},
			text: {
				type: DataTypes.STRING,
				allowNull: false
			},
			timestamp: {
				type: DataTypes.DATE,
				allowNull: false
			}
		},
		{ sequelize, modelName: 'entry' }
	)

	Journal.hasMany(Entry, {
		foreignKey: 'journalId'
	})
}
