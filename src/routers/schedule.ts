import { Router, Request, Response } from "express"
import { prisma } from "../services/prisma"
import { ZodError, z } from "zod"
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library"

export const scheduleRouter = Router()

const getAllSchema = z.object({
  userId: z.string().length(28),
})

scheduleRouter.get("/:userId/schedule", async (req: Request, res: Response) => {
  try {
    const { userId } = getAllSchema.parse({
      userId: req.params.userId,
    })

    const schedules = await prisma.schedule.findMany({
      where: {
        userId,
      },
      include: {
        scheduleInvites: true,
      },
    })

    res.json({
      message: `Retrieved list of schedules`,
      results: schedules,
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
  isoDate: z.string().datetime({
    offset: true,
  }),
  movieId: z.number(),
  invitedFriendIds: z.string().length(28).array(),
})

scheduleRouter.post(
  "/:userId/schedule",
  async (req: Request, res: Response) => {
    try {
      const { userId, isoDate, movieId, invitedFriendIds } = createSchema.parse(
        {
          userId: req.params.userId,
          isoDate: req.body.isoDate,
          movieId: parseInt(req.body.movieId),
          invitedFriendIds: req.body.invitedFriendIds,
        }
      )

      const schedule = await prisma.schedule.create({
        data: {
          userId,
          isoDate,
          movieId,
          scheduleInvites: {
            createMany: {
              data: invitedFriendIds.map((friendId) => {
                return {
                  friendId,
                }
              }),
            },
          },
        },
      })

      res.json({
        message: `Created schedule`,
        result: schedule,
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
            message: "Schedule already exists",
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

const getOneSchema = z.object({
  userId: z.string().length(28),
  isoDate: z.string().datetime({
    offset: true,
  }),
})

scheduleRouter.get(
  "/:userId/schedule/:isoDate",
  async (req: Request, res: Response) => {
    try {
      const { userId, isoDate } = getOneSchema.parse({
        userId: req.params.userId,
        isoDate: req.params.isoDate,
      })

      const schedule = await prisma.schedule.findUnique({
        where: {
          userId_isoDate: {
            userId,
            isoDate,
          },
        },
        include: {
          scheduleInvites: true,
        },
      })

      if (!schedule) {
        res.status(404).json({
          message: "No such schedule",
        })
        return
      }

      res.json({
        message: `Retrieved schedule`,
        result: schedule,
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

const editSchema = z.object({
  userId: z.string().length(28),
  isoDate: z.string().datetime({
    offset: true,
  }),
  newIsoDate: z.string().datetime({
    offset: true,
  }),
  movieId: z.number(),
  invitedFriendIds: z.string().length(28).array(),
})

scheduleRouter.patch(
  "/:userId/schedule/:isoDate",
  async (req: Request, res: Response) => {
    try {
      const { userId, isoDate, movieId, invitedFriendIds, newIsoDate } =
        editSchema.parse({
          userId: req.params.userId,
          isoDate: req.params.isoDate,
          newIsoDate: req.body.isoDate,
          movieId: parseInt(req.body.movieId),
          invitedFriendIds: req.body.invitedFriendIds,
        })

      await prisma.$transaction(async (tx) => {
        await tx.schedule.delete({
          where: {
            userId_isoDate: {
              userId,
              isoDate,
            },
          },
        })

        await tx.schedule.create({
          data: {
            userId,
            isoDate: newIsoDate,
            movieId,
            scheduleInvites: {
              createMany: {
                data: invitedFriendIds.map((friendId) => {
                  return {
                    friendId,
                  }
                }),
              },
            },
          },
        })
      })

      res.json({
        message: `Edited schedule`,
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
            message: "No such schedule",
          })
        else
          res.status(500).json({
            message: "Database error occured",
            error: e,
          })
        return
      }

      console.log("e", e)
      res.status(500).json({
        message: "Unknown error occured",
        error: e,
      })
    }
  }
)

scheduleRouter.delete(
  "/:userId/schedule/:isoDate",
  async (req: Request, res: Response) => {
    try {
      const { userId, isoDate } = getOneSchema.parse({
        userId: req.params.userId,
        isoDate: req.params.isoDate,
      })

      const schedule = await prisma.schedule.delete({
        where: {
          userId_isoDate: {
            userId,
            isoDate,
          },
        },
      })

      res.json({
        message: `Deleted schedule`,
        result: schedule,
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
            message: "No such schedule",
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
