export interface Entry {
	timestamp: string,
	id: number,
	text: string
}

export interface JournalArguments {
	journalName: string,
	directoryName: string,
	pathName: string,
	entries: Entry[],
	output: (msg: string) => void
	errorput: (msg: string) => void
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
