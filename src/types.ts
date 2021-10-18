export interface Entry {
	timestamp: string,
	id: number,
	text: string
}

export interface JournalArguments {
	journalName: string,
	directoryName: string,
	pathName: string,
	entries: Entry[]
}

export interface PrintOptions {
	printDirection: PrintDirection
	amount: number,
}

export enum PrintDirection {
	Front,
	Back
}
