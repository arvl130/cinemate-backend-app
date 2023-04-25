import { config } from "dotenv"
import express from "express"
import cors from "cors"

config()
const { TMDB_API_KEY } = process.env
if (typeof TMDB_API_KEY !== "string") throw new Error("Invalid TMDB API key")

const app = express()
app.use(cors())

//now showing
app.get("/movie/now_showing", async (req, res) => {
  const link = `https://api.themoviedb.org/3/trending/movie/week?api_key=${TMDB_API_KEY}`
  const response = await fetch(link)
  const data = await response.json()

  res.json({
    message: `Search results for Now showing`,
    result: data.results,
  })
})

//Popular movie
app.get("/movie/popular/movie", async (req, res) => {
  const link = `https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_API_KEY}&language=en-US&page=1`
  const response = await fetch(link)
  const data = await response.json()

  res.json({
    message: `Search results for Popular Movie`,
    result: data.results,
  })
})

//Popular TV
app.get("/movie/popular/tv", async (req, res) => {
  const link = `https://api.themoviedb.org/3/tv/popular?api_key=${TMDB_API_KEY}&language=en-US&page=1`
  const response = await fetch(link)
  const data = await response.json()

  res.json({
    message: `Search results for Popular TV Shows`,
    result: data.results,
  })
})

//Popular MOVIE AND TV SHOWS
app.get("/movie/popular", async (req, res) => {
  const link = `https://api.themoviedb.org/3/tv/popular?api_key=${TMDB_API_KEY}&language=en-US&page=1`
  const response = await fetch(link)
  const data = await response.json()
  const link2 = `https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_API_KEY}&language=en-US&page=1`
  const response2 = await fetch(link2)
  const data2 = await response2.json()

  res.json({
    message: `Search results for Popular Movies And TV Shows`,
    result: [...data.results, ...data2.results],
  })
})

//search movie
app.get("/movie/search/:searchTerm", async (req, res) => {
  const link = `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&language=en-US&query=${req.params.searchTerm}&page=1&include_adult=false`
  const response = await fetch(link)
  const data = await response.json()

  res.json({
    message: `Search results for: ${req.params.searchTerm}`,
    result: data.results,
  })
})

//search movie_id
app.get("/movie/:movieid", async (req, res) => {
  const link = `https://api.themoviedb.org/3/movie/${req.params.movieid}?api_key=${TMDB_API_KEY}&language=en-US`
  const response = await fetch(link)
  const data = await response.json()

  res.json({
    message: `Retrieved Movie with ID: ${req.params.movieid}`,
    result: data,
  })
})

const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`Listening on port ${port} ...`)
})
