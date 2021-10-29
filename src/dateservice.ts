import { parseISO as dateParseISO, format as dateFormat } from 'date-fns'

export function getDateService(): IDateService {
	return new DateService()
}

export interface IDateService {
	parseTimestamp(timestamp: string): Date
	getDisplayDate(date: Date): string
	makeTimestamp(): string
}

class DateService implements IDateService {
	parseTimestamp(timestamp: string): Date {
		return dateParseISO(timestamp)
	}
	getDisplayDate(date: Date): string {
		return dateFormat(date, 'EEEE LLLL do yyyy h:mm:ss aaa')
	}
	makeTimestamp(): string {
		return new Date().toISOString()
	}
}
