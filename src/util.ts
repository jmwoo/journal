import { access } from 'fs/promises'
import { constants as fsConstants } from 'fs'

export async function fileExists(pathName: string): Promise<boolean> {
	try {
		await access(pathName, fsConstants.F_OK)
		return true
	} catch (error: any) {
		if (error?.code === 'ENOENT') {
			return false
		}
		throw error
	}
}
