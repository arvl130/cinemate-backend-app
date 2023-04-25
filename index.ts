import { config } from "dotenv"
config()

import express from "express"
import cors from "cors"
import { movieRouter } from "./src/routers/movie"

const app = express()
app.use(cors())
app.use("/movie", movieRouter)

const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`Listening on port ${port} ...`)
})
