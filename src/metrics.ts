import { Entry, IOutput } from "./types"

export function getWordFrequency(entries: Entry[], output: IOutput): void {
	const wordCount = new Map<string, number>()
	const punctuation = ['.', ',', '!', '"', ';', ':', "'", '(', ')']
	for (const entry of entries) {
		entry.text.split(' ').map(word => {
			word = word.toLowerCase()
			for (const p of punctuation) {
				word = word.replace(p, '')
			}
			const count = wordCount.get(word) ?? 0;
			wordCount.set(word, count + 1)
		})
	}
	const sortedWordCount = new Map([...wordCount.entries()].sort((a, b) => b[1] - a[1]))

	let index = 0
	sortedWordCount.forEach((value, key) => {
		output.out(`${++index}) ${key}: ${value}`)
	})
}

export function getTimeOfDayFrequency(entries: Entry[], output: IOutput): void {
	for (const entry of entries) {
	}
	throw new Error('not implemented')
}
