import { getDateService } from '../src/dateservice'

const dateService = getDateService()

describe('dateService', () => {
	test('getDisplayDate()', () => {
		const date = new Date(2021, 9, 12, 11, 30, 40, 50)
		expect(dateService.getDisplayDate(date)).toBe('Tuesday October 12th 2021 11:30:40 am')
	})

	test('parseTimestamp()', () => {
		const timestamp = '2021-10-18T12:11:40.633Z' // utc
		const date = dateService.parseTimestamp(timestamp) // local
		expect(date.getFullYear()).toBe(2021)
		expect(date.getMonth()).toBe(9)
		expect(date.getDate()).toBe(18)
		expect(date.getHours()).toBe(12 - date.getTimezoneOffset() / 60)
		expect(date.getMinutes()).toBe(11)
		expect(date.getSeconds()).toBe(40)
	})

	test('makeTimestamp()', () => {
		const timestamp = dateService.makeTimestamp()
		expect(/^\d+$/.test(timestamp.slice(0, 4))).toBe(true)
		expect(timestamp[timestamp.length - 1]).toBe('Z')
	})
})
