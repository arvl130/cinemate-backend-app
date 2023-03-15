const express = require("express")
const cors = require("cors")
const app = express()
require("dotenv").config()

app.use(cors())

app.get("/movie/search/:searchTerm", async (req, res) => {
  const apiKey = process.env.TMDB_API_KEY
  const link = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&language=en-US&query=${req.params.searchTerm}&page=1&include_adult=false`
  const response = await fetch(link)
  const data = await response.json()

  res.json({
    message: `Search results for: ${req.params.searchTerm}`,
    result: data.results,
  })
})

const port = process.env.PORT | 3000

app.listen(port, () => {
  console.log(`Listening on port ${port} ...`)
})
