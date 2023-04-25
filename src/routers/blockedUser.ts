import { Router, Request, Response } from "express"
import { ZodError, z } from "zod"
import { prisma } from "../services/prisma"
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library"
export const blockedUserRouter = Router()

const getAllSchema = z.object({
  userId: z.string().length(28),
})

blockedUserRouter.get(
  "/:userId/blocked",
  async (req: Request, res: Response) => {
    try {
      const { userId } = getAllSchema.parse({
        userId: req.params.userId,
      })
      const blockedUsers = await prisma.blockedUser.findMany({
        where: {
          userId,
        },
      })

      res.json({
        message: `Retrieved blocked users`,
        results: blockedUsers,
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
  blockedUserId: z.string().length(28),
})

blockedUserRouter.post(
  "/:userId/blocked",
  async (req: Request, res: Response) => {
    try {
      const { userId, blockedUserId } = createSchema.parse({
        userId: req.params.userId,
        blockedUserId: req.body.blockedUserId,
      })

      await prisma.blockedUser.create({
        data: {
          userId,
          blockedUserId,
        },
      })

      res.json({
        message: `Added blocked user`,
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
            message: "User is already blocked",
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

blockedUserRouter.delete(
  "/:userId/blocked/:blockedUserId",
  async (req: Request, res: Response) => {
    try {
      const { userId, blockedUserId } = createSchema.parse({
        userId: req.params.userId,
        blockedUserId: req.params.blockedUserId,
      })

      await prisma.blockedUser.deleteMany({
        where: {
          userId,
          blockedUserId,
        },
      })

      res.json({
        message: `Removed blocked user`,
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
