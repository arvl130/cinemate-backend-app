import { Router, Request, Response } from "express"
import { prisma } from "../services/prisma"
import { ZodError, z } from "zod"
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library"
import { getUserIdFromHeaders } from "../services/firebase"

export const reviewRouter = Router()

const getAllSchema = z.object({
  movieId: z.number(),
})

reviewRouter.get("/:movieId/review", async (req: Request, res: Response) => {
  try {
    const { movieId } = getAllSchema.parse({
      movieId: parseInt(req.params.movieId),
    })
    const reviews = await prisma.review.findMany({
      where: {
        movieId,
      },
    })

    res.json({
      message: `Retrieved list of reviews`,
      results: reviews,
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
  movieId: z.number(),
  userId: z.string().length(28),
  details: z.string().max(5000),
  rating: z.number().min(1).max(5),
})

reviewRouter.post("/:movieId/review", async (req: Request, res: Response) => {
  try {
    const userIdFromHeaders = await getUserIdFromHeaders(req)
    if (!userIdFromHeaders) {
      res.status(401).json({
        message: "Unauthorized",
      })
      return
    }

    const { movieId, userId, details, rating } = createSchema.parse({
      movieId: parseInt(req.params.movieId),
      userId: userIdFromHeaders,
      details: req.body.details,
      rating: req.body.rating,
    })

    const review = await prisma.review.create({
      data: {
        movieId,
        userId,
        details,
        rating,
      },
    })

    res.json({
      message: `Created review`,
      result: review,
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
          message: "Review already exists",
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

const getOneSchema = z.object({
  movieId: z.number(),
  userId: z.string().length(28),
})

reviewRouter.get(
  "/:movieId/review/:userId",
  async (req: Request, res: Response) => {
    try {
      const { movieId, userId } = getOneSchema.parse({
        movieId: parseInt(req.params.movieId),
        userId: req.params.userId,
      })

      const review = await prisma.review.findUnique({
        where: {
          movieId_userId: {
            movieId,
            userId,
          },
        },
      })

      if (!review) {
        res.status(404).json({
          message: "No such review",
        })
        return
      }

      res.json({
        message: `Retrieved review`,
        result: review,
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

const updateSchema = z.object({
  movieId: z.number(),
  userId: z.string().length(28),
  details: z.string().max(5000),
  rating: z.number().min(1).max(5),
})

reviewRouter.patch(
  "/:movieId/review/:userId",
  async (req: Request, res: Response) => {
    try {
      const { movieId, userId, details, rating } = updateSchema.parse({
        movieId: parseInt(req.params.movieId),
        userId: req.params.userId,
        details: req.body.details,
        rating: req.body.rating,
      })

      const review = await prisma.review.update({
        where: {
          movieId_userId: {
            movieId,
            userId,
          },
        },
        data: {
          details,
          rating,
        },
      })

      res.json({
        message: `Edited review`,
        result: review,
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
        if (e.code === "P2025")
          res.status(404).json({
            message: "No such review",
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

const deleteSchema = z.object({
  movieId: z.number(),
  userId: z.string().length(28),
})

reviewRouter.delete(
  "/:movieId/review/:userId",
  async (req: Request, res: Response) => {
    try {
      const { movieId, userId } = deleteSchema.parse({
        movieId: parseInt(req.params.movieId),
        userId: req.params.userId,
      })

      const review = await prisma.review.delete({
        where: {
          movieId_userId: {
            movieId,
            userId,
          },
        },
      })

      res.json({
        message: `Deleted review`,
        result: review,
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
        if (e.code === "P2025")
          res.status(404).json({
            message: "No such review",
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
