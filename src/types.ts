export interface Entry {
	timestamp: string,
	id: number,
	text: string
}

export interface JournalArguments {
	journalName: string,
	entries: Entry[],
	saveToFile: (entries: Entry[]) => Promise<void>,
	output: IOutput
	useColors: boolean
}

export interface PrintOptions {
	printDirection: PrintDirection
	amount: number,
}

export enum PrintDirection {
	First,
	Last
}

export interface IOutput {
	log: (msg: string) => void
	error: (msg: string) => void
}
