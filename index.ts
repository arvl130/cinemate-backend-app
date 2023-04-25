import { config } from "dotenv"
import express from "express"
import cors from "cors"
import TMDB from "tmdb-ts"

config()
const { TMDB_ACCESS_TOKEN } = process.env
if (typeof TMDB_ACCESS_TOKEN !== "string")
  throw new Error("Invalid TMDB access token")

const tmdb = new TMDB(TMDB_ACCESS_TOKEN)
const app = express()
app.use(cors())

//now showing
app.get("/movie/now_showing", async (req, res) => {
  const { results } = await tmdb.trending.trending("movie", "week")

  res.json({
    message: `Search results for Now showing`,
    results,
  })
})

//Popular movie
app.get("/movie/popular/movie", async (req, res) => {
  const { results } = await tmdb.movies.popular()

  res.json({
    message: `Search results for Popular Movie`,
    results,
  })
})

//Popular TV
app.get("/movie/popular/tv", async (req, res) => {
  const { results } = await tmdb.tvShows.popular()

  res.json({
    message: `Search results for Popular TV Shows`,
    results,
  })
})

//Popular MOVIE AND TV SHOWS
app.get("/movie/popular", async (req, res) => {
  const popularMovies = await tmdb.movies.popular()
  const popularTvShows = await tmdb.tvShows.popular()

  res.json({
    message: `Search results for Popular Movies And TV Shows`,
    results: [...popularMovies.results, ...popularTvShows.results],
  })
})

//search movie
app.get("/movie/search/:searchTerm", async (req, res) => {
  const { results } = await tmdb.search.movies({
    query: req.params.searchTerm,
  })

  res.json({
    message: `Search results for: ${req.params.searchTerm}`,
    results,
  })
})

//search movie_id
app.get("/movie/:movieid", async (req, res) => {
  const movie = await tmdb.movies.details(req.params.movieid)

  res.json({
    message: `Retrieved Movie with ID: ${req.params.movieid}`,
    result: movie,
  })
})

const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`Listening on port ${port} ...`)
})
