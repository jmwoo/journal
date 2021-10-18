import { Journal } from './journal2'

async function main() {
    const journal = await Journal.create('main')
    journal.print()
}

main()