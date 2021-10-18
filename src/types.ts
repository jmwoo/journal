export interface Entry {
    timestamp: string,
    id: number,
    text: string
}

export interface JouralArgs {
    journalName: string,
    directoryName: string,
    pathName: string,
    entries: Entry[]
}