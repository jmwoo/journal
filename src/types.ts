export interface PrintOptions {
	direction: Direction
	amount: number
}

export enum Direction {
	First,
	Last
}

export interface IOutput {
	log: (msg: string) => void
	error: (msg: string) => void
}

export interface EntryModel {
	entryId: number
	journalId: number
	text: string
	timestamp: Date
}

export interface JournalModel {
	journalId: number
	name: string
}
