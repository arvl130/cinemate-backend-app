import { Router, Request, Response } from "express"
import { ZodError, z } from "zod"
import { prisma } from "../services/prisma"
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library"
export const friendRouter = Router()

const getAllSchema = z.object({
  userId: z.string().length(28),
})

friendRouter.get("/:userId/friend", async (req: Request, res: Response) => {
  try {
    const { userId } = getAllSchema.parse({
      userId: req.params.userId,
    })
    const friends = await prisma.friend.findMany({
      where: {
        userId,
      },
    })

    res.json({
      message: `Retrieved friends`,
      results: friends,
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
  friendId: z.string().length(28),
})

friendRouter.post("/:userId/friend", async (req: Request, res: Response) => {
  try {
    const { userId, friendId } = createSchema.parse({
      userId: req.params.userId,
      friendId: req.body.friendId,
    })

    await prisma.friend.create({
      data: {
        userId,
        friendId,
      },
    })

    res.json({
      message: `Added friend`,
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
          message: "Friend is already added",
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

friendRouter.delete(
  "/:userId/friend/:friendId",
  async (req: Request, res: Response) => {
    try {
      const { userId, friendId } = createSchema.parse({
        userId: req.params.userId,
        friendId: req.params.friendId,
      })

      await prisma.friend.deleteMany({
        where: {
          userId,
          friendId,
        },
      })

      res.json({
        message: `Removed friend`,
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
