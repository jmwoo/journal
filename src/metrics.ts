import { Entry } from './types'
import { parseISO as dateParseISO, format as dateFormat } from 'date-fns'

interface JournalMetrics {
	wordFrequency: Map<string, number>
	dayOfWeekFrequency: Map<string, number>
	hourOfDayFrequency: Map<string, number>
}

const sortByValueDesc = (map: Map<any, number>): Map<any, number> => {
	return new Map([...map.entries()].sort((a, b) => b[1] - a[1]))
}

const increment = (map: Map<any, number>, key: any): void => {
	map.set(key, (map.get(key) ?? 0) + 1)
}

export function getMetrics(entries: Entry[]): JournalMetrics {
	const wordFrequency = new Map<string, number>()
	const dayOfWeekFrequency = new Map<string, number>()
	const hourOfDayFrequency = new Map<string, number>()
	const punctuation = ['.', ',', '!', '"', ';', ':', "'", '(', ')']

	for (const entry of entries) {
		const date = dateParseISO(entry.timestamp)
		const dayOfWeek = dateFormat(date, 'EEEE')
		const hourOfDay = dateFormat(date, 'h aaa')

		increment(dayOfWeekFrequency, dayOfWeek)
		increment(hourOfDayFrequency, hourOfDay)
		entry.text.split(' ').map(word => {
			word = word.toLowerCase()
			for (const p of punctuation) {
				word = word.replace(p, '')
			}
			increment(wordFrequency, word)
		})
	}

	return {
		wordFrequency: sortByValueDesc(wordFrequency),
		dayOfWeekFrequency: sortByValueDesc(dayOfWeekFrequency),
		hourOfDayFrequency: sortByValueDesc(hourOfDayFrequency)
	}
}
