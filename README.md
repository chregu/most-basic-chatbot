# Most Basic Chatbot

This is the most basic chatbot I could think of doing in node.js/typescript. With crawling some sites, chunking, and answering in the console.

More of a demo what basic steps are needed to create such a thing and certainly not something I'd trust in.


## Installation

```bash
yarn # or npm install
cp .env.example .env
``` 
and add your OpenAI API key to the .env file.

Then start a pgvector database with docker-compose:

```bash
docker-compose up -d
```

Crawling the sites (defined in `src/crawl.ts`) can be done with:

```bash
yarn crawl
```

And then you can ask the chatbot questions about St. Gallen with:

```bash
yarn ask "Wann wurde St. Gallen gegründet?"
```
