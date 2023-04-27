import { Router, Request, Response } from "express"
import { ZodError, z } from "zod"
import { prisma } from "../services/prisma"
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library"
import { getUserProfile } from "../services/firebase"
import { UserRecord } from "firebase-admin/auth"
export const userRouter = Router()

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
