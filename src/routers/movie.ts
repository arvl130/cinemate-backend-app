import { Request, Response, Router } from "express"
import { tmdb } from "../services/tmdb"

export const movieRouter = Router()

//now showing
movieRouter.get("/now_showing", async (req: Request, res: Response) => {
  const { results } = await tmdb.trending.trending("movie", "week")

  res.json({
    message: `Search results for Now showing`,
    results,
  })
})

//Popular movie
movieRouter.get("/popular/movie", async (req: Request, res: Response) => {
  const { results } = await tmdb.movies.popular()

  res.json({
    message: `Search results for Popular Movie`,
    results,
  })
})

//Popular TV
movieRouter.get("/popular/tv", async (req: Request, res: Response) => {
  const { results } = await tmdb.tvShows.popular()

  res.json({
    message: `Search results for Popular TV Shows`,
    results,
  })
})

//Popular MOVIE AND TV SHOWS
movieRouter.get("/popular", async (req: Request, res: Response) => {
  const popularMovies = await tmdb.movies.popular()
  const popularTvShows = await tmdb.tvShows.popular()

  res.json({
    message: `Search results for Popular Movies And TV Shows`,
    results: [...popularMovies.results, ...popularTvShows.results],
  })
})

//search movie
movieRouter.get("/search/:searchTerm", async (req: Request, res: Response) => {
  const { results } = await tmdb.search.movies({
    query: req.params.searchTerm,
  })

  res.json({
    message: `Search results for: ${req.params.searchTerm}`,
    results,
  })
})

//search movie_id
movieRouter.get("/:movieid", async (req: Request, res: Response) => {
  const movie = await tmdb.movies.details(parseInt(req.params.movieid))

  res.json({
    message: `Retrieved Movie with ID: ${req.params.movieid}`,
    result: movie,
  })
})
