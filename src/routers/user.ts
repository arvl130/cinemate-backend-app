import { Router, Request, Response } from "express"
import { ZodError, z } from "zod"
import { getAllUsers, getUserProfile } from "../services/firebase"
import { UserRecord } from "firebase-admin/auth"
import { prisma } from "../services/prisma"
export const userRouter = Router()

const searchSchema = z.object({
  query: z.string().min(1),
})

userRouter.get("/search/:query", async (req: Request, res: Response) => {
  try {
    const { query } = searchSchema.parse({
      query: req.params.query,
    })
    const userRecords = await getAllUsers()
    const matchingUserRecords = userRecords.filter((userRecord) => {
      if (!userRecord.displayName) return false

      return userRecord.displayName.toLowerCase().includes(query.toLowerCase())
    })

    res.json({
      message: `Retrieved matching user profiles`,
      results: matchingUserRecords.map((userRecord) => userRecord.toJSON()),
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

const getAllSchema = z.object({
  userId: z.string().length(28),
})

userRouter.get("/:userId", async (req: Request, res: Response) => {
  try {
    const { userId } = getAllSchema.parse({
      userId: req.params.userId,
    })
    const userRecord = await getUserProfile(userId)

    res.json({
      message: `Retrieved user profile`,
      result: userRecord as UserRecord,
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

const getSavedSchema = z.object({
  userId: z.string().length(28),
})

userRouter.get("/:userId/saved", async (req: Request, res: Response) => {
  try {
    const { userId } = getSavedSchema.parse({
      userId: req.params.userId,
    })
    const userMovies = await prisma.userMovie.findMany({
      where: {
        userId,
      },
    })

    res.json({
      message: `Retrieved saved list`,
      results: userMovies,
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

const getReviewedSchema = z.object({
  userId: z.string().length(28),
})

userRouter.get("/:userId/reviewed", async (req: Request, res: Response) => {
  try {
    const { userId } = getReviewedSchema.parse({
      userId: req.params.userId,
    })
    const reviewedMovies = await prisma.review.findMany({
      where: {
        userId,
      },
    })

    res.json({
      message: `Retrieved reviewed movies list`,
      results: reviewedMovies,
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
