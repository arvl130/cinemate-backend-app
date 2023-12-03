import { Request, Response, Router } from "express"
import { tmdb } from "../services/tmdb"
import { prisma } from "../services/prisma"
import {
  getMovieRecommendationsByCategory,
  getRandomMovieRecommendations,
} from "../services/openai"
import { ZodError, z } from "zod"

export const movieRouter = Router()

const getRecommendationsByCategory = z.object({
  category: z.union([
    z.literal("Action"),
    z.literal("Adventure"),
    z.literal("Animation"),
    z.literal("Biography"),
    z.literal("Comedy"),
    z.literal("Crime"),
    z.literal("Documentary"),
    z.literal("Drama"),
    z.literal("Family"),
    z.literal("Fantasy"),
    z.literal("Film-Noir"),
    z.literal("History"),
    z.literal("Horror"),
    z.literal("Musical"),
    z.literal("Mystery"),
    z.literal("Romance"),
    z.literal("Sci-Fi"),
    z.literal("Sport"),
    z.literal("Thriller"),
    z.literal("War"),
    z.literal("Western"),
    z.literal("Art-house"),
    z.literal("Black-Comedy"),
    z.literal("Chick-flick"),
    z.literal("Cult-classic"),
    z.literal("Dark-Comedy"),
    z.literal("Epic"),
    z.literal("Experimental"),
    z.literal("Fairy-tale"),
    z.literal("Film-within-a-film"),
    z.literal("Futuristic"),
    z.literal("Gangster"),
    z.literal("Heist"),
    z.literal("Historical"),
    z.literal("Holiday"),
    z.literal("Indie"),
    z.literal("Juvenile"),
    z.literal("Melodrama"),
    z.literal("Monster"),
    z.literal("Political"),
    z.literal("Psychological"),
    z.literal("Road-movie"),
    z.literal("Satire"),
    z.literal("Science-Fiction"),
    z.literal("Slapstick"),
    z.literal("Social-issue"),
    z.literal("Superhero"),
    z.literal("Surreal"),
    z.literal("Teen"),
    z.literal("Vampire"),
    z.literal("Zombie"),
  ]),
})

movieRouter.get(
  "/ai-recommendations/:category",
  async (req: Request, res: Response) => {
    res.json({
      message: "Retrieved AI-generated movie recommendations",
      results: [],
    })
  }
)

movieRouter.get("/ai-recommendations", async (req: Request, res: Response) => {
  res.json({
    message: "Retrieved AI-generated movie recommendations",
    results: [],
  })
})

//now showing
movieRouter.get("/now_showing", async (req: Request, res: Response) => {
  const { results } = await tmdb.trending.trending("movie", "week")

  res.json({
    message: `Search results for Now showing`,
    results: results.slice(0, 5),
  })
})

//Popular movie
movieRouter.get("/popular/movie", async (req: Request, res: Response) => {
  const { results } = await tmdb.movies.popular()

  res.json({
    message: `Search results for Popular Movie`,
    results: results.slice(0, 10),
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
