import commandLineArgs from 'command-line-args'
import OpenAI from 'openai'

const openAIclient = new OpenAI({
  apiKey: process.env['OPENAI_API_KEY'],
})
import chalk from 'chalk'

import sql from './helpers/db'

const main = async () => {
  // parse the command line arguments to get the question
  const args = commandLineArgs([
    { name: 'question', type: String, optional: false, defaultOption: true },
  ])
  const question = args.question
  console.log(`Searching for: ${question}`)

  // get embedding for the question
  const result = await openAIclient.embeddings.create({
    model: 'text-embedding-3-small',
    input: question,
  })

  // search the chunks with the most similar embeddings
  const vector = JSON.stringify(result.data[0].embedding)
  const similarityThreshold = 0.3 // pretty randomly choosen threshold, if a chunk is less similar, it is not returned
  const chunkLimit = 5 // limit the number of chunks to return, the more you return, the longer the prompt, the pricier the request
  const contents = await sql`
    SELECT content,
           (embedding <#> ${vector}) * -1 as similarity
    FROM chunks
    where ((embedding <#> ${vector}) * -1) > ${similarityThreshold}
    order by (similarity) DESC
      LIMIT ${chunkLimit}
  `

  console.log('Found', contents.length, ' matching chunks')

  // Join all the information into one string for the prompt
  const content = contents.map((c) => c.content).join('"""\n"""\n')

  // send the prompt to the chat model
  const completion = await openAIclient.chat.completions.create({
    model: 'gpt-4o-mini',
    stream: true,
    messages: [
      {
        role: 'system',
        content: `
Du bist ein hilfreicher Assistent  und gibst gerne Auskunft. 
Mit den folgenden Inhalten (abgegrenzt durch dreifache Quotes """), beantworte die Frage am Ende nur mit den Informationen, die aus diesen Inhalten stammen.
Falls du dir nicht sicher sind und die Antwort nicht in den gelieferten Inhalten steht, antworte mit: "Ich weiss nicht, wie ich dir helfen kann."
Erfinde keine Antworten! Halluziniere nicht! 
`,
      },
      {
        role: 'user',
        content: `
Inhalte:        
"""
${content}
"""
***
Frage: ${question}
***
Antwort:
`,
      },
    ],
  })

  console.log('*** Answer ***')

  // output the answer to the console via streaming
  for await (const chunk of completion) {
    process.stdout.write(chalk.green(chunk.choices[0]?.delta?.content || ''))
  }

  process.stdout.write('\n')
  console.log('**************')

  process.exit(0)
}

main()
