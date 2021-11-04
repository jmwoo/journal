export class ExecutionTimer {
	public static start(): ITimer {
		return new Timer(process.hrtime())
	}
}

interface ITimer {
	stop(): TimerResult
}

class Timer implements ITimer {
	public readonly startTime: [number, number]

	constructor(start: [number, number]) {
		this.startTime = start
	}

	public stop(): TimerResult {
		const endTime = process.hrtime(this.startTime)
		return {
			start: this.startTime,
			end: endTime,
			seconds: endTime[0],
			milliseconds: endTime[1] / 1000000
		}
	}
}

interface TimerResult {
	start: [number, number]
	end: [number, number]
	seconds: number
	milliseconds: number
}
