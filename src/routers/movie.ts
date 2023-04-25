import express from "express"
import TMDB from "tmdb-ts"

const { TMDB_ACCESS_TOKEN } = process.env
if (typeof TMDB_ACCESS_TOKEN !== "string")
  throw new Error("Invalid TMDB access token")

export const movieRouter = express.Router()

//now showing
movieRouter.get("/now_showing", async (req, res) => {
  const tmdb = new TMDB(TMDB_ACCESS_TOKEN)
  const { results } = await tmdb.trending.trending("movie", "week")

  res.json({
    message: `Search results for Now showing`,
    results,
  })
})

//Popular movie
movieRouter.get("/popular/movie", async (req, res) => {
  const tmdb = new TMDB(TMDB_ACCESS_TOKEN)
  const { results } = await tmdb.movies.popular()

  res.json({
    message: `Search results for Popular Movie`,
    results,
  })
})

//Popular TV
movieRouter.get("/popular/tv", async (req, res) => {
  const tmdb = new TMDB(TMDB_ACCESS_TOKEN)
  const { results } = await tmdb.tvShows.popular()

  res.json({
    message: `Search results for Popular TV Shows`,
    results,
  })
})

//Popular MOVIE AND TV SHOWS
movieRouter.get("/popular", async (req, res) => {
  const tmdb = new TMDB(TMDB_ACCESS_TOKEN)
  const popularMovies = await tmdb.movies.popular()
  const popularTvShows = await tmdb.tvShows.popular()

  res.json({
    message: `Search results for Popular Movies And TV Shows`,
    results: [...popularMovies.results, ...popularTvShows.results],
  })
})

//search movie
movieRouter.get("/search/:searchTerm", async (req, res) => {
  const tmdb = new TMDB(TMDB_ACCESS_TOKEN)
  const { results } = await tmdb.search.movies({
    query: req.params.searchTerm,
  })

  res.json({
    message: `Search results for: ${req.params.searchTerm}`,
    results,
  })
})

//search movie_id
movieRouter.get("/:movieid", async (req, res) => {
  const tmdb = new TMDB(TMDB_ACCESS_TOKEN)
  const movie = await tmdb.movies.details(req.params.movieid)

  res.json({
    message: `Retrieved Movie with ID: ${req.params.movieid}`,
    result: movie,
  })
})
