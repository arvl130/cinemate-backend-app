import { config } from "dotenv"
config()

import express from "express"
import cors from "cors"
import { movieRouter } from "./routers/movie"
import { reviewRouter } from "./routers/review"
import { scheduleRouter } from "./routers/schedule"
import { watchedRouter } from "./routers/watched"
import { watchListRouter } from "./routers/watchlist"
import { friendRouter } from "./routers/friend"
import { blockedUserRouter } from "./routers/blockedUser"

const app = express()
app.use(cors())
app.use(express.json())

app.use("/movie", movieRouter)
app.use("/movie", reviewRouter)

app.use("/user", scheduleRouter)
app.use("/user", watchedRouter)
app.use("/user", watchListRouter)
app.use("/user", friendRouter)
app.use("/user", blockedUserRouter)

const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`Listening on port ${port} ...`)
})
