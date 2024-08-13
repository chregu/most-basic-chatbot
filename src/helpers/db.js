import * as dotenv from 'dotenv'
import postgres from 'postgres'
dotenv.config()

const sql = postgres({
  /* options */
}) // will use psql environment variables

export default sql
