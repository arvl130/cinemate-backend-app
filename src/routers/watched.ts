import { Router, Request, Response } from "express"
import { ZodError, z } from "zod"
import { prisma } from "../services/prisma"
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library"
export const watchedRouter = Router()

const getAllSchema = z.object({
  userId: z.string().length(28),
})

watchedRouter.get("/:userId/watched", async (req: Request, res: Response) => {
  try {
    const { userId } = getAllSchema.parse({
      userId: req.params.userId,
    })
    const watchedMovies = await prisma.userMovie.findMany({
      where: {
        userId,
        watchStatus: "Watched",
      },
    })

    res.json({
      message: `Retrieved watched movies`,
      results: watchedMovies,
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
})

const createSchema = z.object({
  userId: z.string().length(28),
  movieId: z.number(),
})

watchedRouter.post("/:userId/watched", async (req: Request, res: Response) => {
  try {
    const { userId, movieId } = createSchema.parse({
      userId: req.params.userId,
      movieId: parseInt(req.body.movieId),
    })

    const watchListMovie = await prisma.userMovie.findFirst({
      where: {
        userId,
        movieId,
        watchStatus: "WatchList",
      },
    })

    if (watchListMovie) {
      res.status(409).json({
        message: "Already added in watchlist",
      })
      return
    }

    await prisma.userMovie.create({
      data: {
        userId,
        movieId,
        watchStatus: "Watched",
      },
    })

    res.json({
      message: `Created watched entry`,
    })
  } catch (e) {
    if (e instanceof ZodError) {
      res.status(400).json({
        message: "Validation error occured",
        error: e,
      })
      return
    }

    if (e instanceof PrismaClientKnownRequestError) {
      if (e.code === "P2002")
        res.status(409).json({
          message: "Watched entry already exists",
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
})

watchedRouter.delete(
  "/:userId/watched/:movieId",
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
          watchStatus: "Watched",
        },
      })

      res.json({
        message: `Deleted watched entry`,
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
