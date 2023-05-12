import { config } from "dotenv"
config()

import express from "express"
import cors from "cors"
import { movieRouter } from "./src/routers/movie"
import { reviewRouter } from "./src/routers/review"
import { scheduleRouter } from "./src/routers/schedule"
import { watchedRouter } from "./src/routers/watched"
import { watchListRouter } from "./src/routers/watchlist"
import { friendRouter } from "./src/routers/friend"
import { blockedUserRouter } from "./src/routers/blockedUser"
import { userRouter } from "./src/routers/user"

const app = express()
app.use(cors())
app.use(express.json())

app.use("/movie", movieRouter)
app.use("/movie", reviewRouter)

app.use("/user", userRouter)
app.use("/user", scheduleRouter)
app.use("/user", watchedRouter)
app.use("/user", watchListRouter)
app.use("/user", friendRouter)
app.use("/user", blockedUserRouter)

const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`Listening on port ${port} ...`)
})
