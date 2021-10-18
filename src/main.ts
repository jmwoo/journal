import { getJournal } from './journal2'
import { PrintDirection } from './types'

async function main() {

	if (false) { // if no args, do nothing
		return
	}

	if (true) { // if print

	}
	else if (false) { // if search
		
	}
	else if (false) { // if write
		
	}
	const journal = await getJournal('main')
	journal.print({printDirection: PrintDirection.Front})
}

main()