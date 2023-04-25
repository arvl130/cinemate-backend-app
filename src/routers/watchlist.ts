import { Router, Request, Response } from "express"
import { ZodError, z } from "zod"
import { prisma } from "../services/prisma"
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library"
export const watchListRouter = Router()

const getAllSchema = z.object({
  userId: z.string().length(28),
})

watchListRouter.get(
  "/:userId/watchlist",
  async (req: Request, res: Response) => {
    try {
      const { userId } = getAllSchema.parse({
        userId: req.params.userId,
      })
      const watchlist = await prisma.userMovie.findMany({
        where: {
          userId,
          watchStatus: "WatchList",
        },
      })

      res.json({
        message: `Retrieved watchlist`,
        results: watchlist,
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

const createSchema = z.object({
  userId: z.string().length(28),
  movieId: z.number(),
})

watchListRouter.post(
  "/:userId/watchlist",
  async (req: Request, res: Response) => {
    try {
      const { userId, movieId } = createSchema.parse({
        userId: req.params.userId,
        movieId: parseInt(req.body.movieId),
      })

      const watchedMovie = await prisma.userMovie.findFirst({
        where: {
          userId,
          movieId,
          watchStatus: "Watched",
        },
      })

      if (watchedMovie) {
        res.status(409).json({
          message: "Already added in watched movies",
        })
        return
      }

      await prisma.userMovie.create({
        data: {
          userId,
          movieId,
          watchStatus: "WatchList",
        },
      })

      res.json({
        message: `Created watchlist entry`,
      })
    } catch (e) {
      if (e instanceof ZodError) {
        res.status(400).json({
          message: "Validation error occured",
          error: e,
        })
        return
      }

      console.log(e)
      if (e instanceof PrismaClientKnownRequestError) {
        if (e.code === "P2002")
          res.status(409).json({
            message: "Watchlist entry already exists",
          })
        else
          res.status(500).json({
            message: "Database error occured",
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

watchListRouter.delete(
  "/:userId/watchlist/:movieId",
  async (req: Request, res: Response) => {
    try {
      const { userId, movieId } = createSchema.parse({
        userId: req.params.userId,
        movieId: parseInt(req.params.movieId),
      })

      await prisma.userMovie.deleteMany({
        where: {
          userId,
          movieId,
          watchStatus: "WatchList",
        },
      })

      res.json({
        message: `Deleted watchlist entry`,
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
