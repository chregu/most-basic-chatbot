import * as cheerio from 'cheerio'
import OpenAI from 'openai'

import sql from './helpers/db'
import { turndownService } from './helpers/turndownService'

// the urls to be crawled and inserted into the databases
const urls = [
  'https://de.wikipedia.org/wiki/St._Gallen',
  'https://de.wikipedia.org/wiki/Drei_Weieren',
  'https://de.wikipedia.org/wiki/Geschichte_der_Stadt_St._Gallen',
  'https://de.wikipedia.org/wiki/St._Galler_Globus',
]

// create the openai client
const openAIclient = new OpenAI({
  apiKey: process.env['OPENAI_API_KEY'],
})

/**
 * Fetches the content of a wikipedia page, extracts the relevant part and splits it into chunks via markdown headers
 */
async function getChunks(url: string) {
  // fetch the url with node-fetch
  console.log(`Fetching and chunking ${url}`)
  const response = await fetch(url)

  // get the html source as text
  const html = await response.text()

  // parse the html with cheerio to use css selectors for getting the relevant content
  const $ = cheerio.load(html)

  // remove unneeded stuff
  $('.mw-editsection').remove()
  $('img').remove()

  // extract the relevant content from the html
  const relevantHTML = $('#mw-content-text').html()

  // convert it to markdown
  const markdown = turndownService.turndown(relevantHTML)

  // split the markdown into chunks by markdown titles
  return markdown.split(/\n#+/).map(
    (chunk) =>
      `# ${chunk}` // re-add the split away markdown header
        .substring(0, 20_000), // limit the size to 20_000 characters. Embeddings can have at most 8k tokens and this is a good enough approach.  In a real setting, this should of course be solved differently
  )
}

/**
 * Fetches the embeddings for the chunks and stores them in the database
 */
const vectorizeAndStore = async (url: string, chunks: string[]) => {
  // fetch the embeddings for all the chunks at once
  const result = await openAIclient.embeddings.create({
    model: 'text-embedding-3-small',
    input: chunks,
  })

  console.log(`Get embeddings for ${url} with ${chunks.length} chunks`)

  // insert the chunks into the database
  for (const d of result.data) {
    const i = d.index
    // add the index to the url after a hash to make it unique
    const urlWithHash = `${url}#${i}`
    await sql`
            INSERT INTO chunks (url, content, embedding)
            VALUES (${urlWithHash}, ${chunks[i]}, ${JSON.stringify(d.embedding)}) 
            ON CONFLICT (url) DO
            UPDATE SET
                content = EXCLUDED.content,
                embedding = EXCLUDED.embedding`
  }
  console.log(
    `Inserted/Updated ${url}. Used ${result.usage.total_tokens} tokens`,
  )
}

const main = async () => {
  for (const url of urls) {
    const chunks = await getChunks(url)
    await vectorizeAndStore(url, chunks)
  }
  process.exit(0)
}

main()
