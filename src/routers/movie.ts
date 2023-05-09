import { Request, Response, Router } from "express"
import { tmdb } from "../services/tmdb"
import { prisma } from "../services/prisma"
import { ZodError, z } from "zod"

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

const getOverallRatingSchema = z.object({
  movieId: z.number(),
})

//search movie_id
movieRouter.get(
  "/:movieId/overall-rating",
  async (req: Request, res: Response) => {
    try {
      const { movieId } = getOverallRatingSchema.parse({
        movieId: parseInt(req.params.movieId),
      })

      const reviews = await prisma.review.findMany({
        where: {
          movieId,
        },
      })

      const rating =
        reviews.length > 0
          ? Math.floor(
              reviews.reduce((runningTally, review) => {
                return runningTally + review.rating
              }, 0) / reviews.length
            )
          : 0

      res.json({
        message: `Retrieved overall rating for movie with ID: ${req.params.movieid}`,
        result: {
          rating,
          reviewCount: reviews.length,
        },
      })
    } catch (e) {
      if (e instanceof ZodError) {
        res.status(400).json({
          message: "Validation error occured",
          error: e,
        })
        return
      }

      res.status(500).json({
        message: "Unknown error occured",
        error: e,
      })
    }
  }
)
