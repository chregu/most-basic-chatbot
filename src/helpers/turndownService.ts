import TurndownService from '@joplin/turndown'
import { tables } from '@joplin/turndown-plugin-gfm'

// Makes markdown out of html, including tables
export const turndownService = new TurndownService({
  headingStyle: 'atx',
  preserveNestedTables: true,
})
turndownService.use(tables)
