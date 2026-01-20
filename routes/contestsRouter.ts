import express from "express";
export const contestsRouter = express.Router();
import { prisma } from "../lib/prisma";
import { tokenValidation } from "../middleware/token";
import { createContestsSchema } from "../validator/contestsValidator";

//creator only route - for creating contests
contestsRouter.post("/", tokenValidation, async (req, res) => {
  try {
    const data = createContestsSchema.safeParse(req.body);
    if (!data.success) {
      return res.status(400).json({
        success: false,
        data: null,
        error: "INVALID_REQUEST",
      });
    }
    const userId = req.userId;
    const role = req.role;

    if (role !== "creator") {
      return res.status(403).json({
        success: false,
        data: null,
        error: "FORBIDDEN",
      });
    }

    const { title, description, startTime, endTime } = data.data;

    const contest = await prisma.contest.create({
      data: {
        title,
        description,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        creatorId: req.userId!,
      },
    });

    res.status(201).json({
      success: true,
      data: {
        id: contest.id,
        title: contest.title,
        description: contest.description,
        creatorId: contest.creatorId,
        startTime: contest.startTime.toISOString(), // convert date object to iso format
        endTime: contest.endTime.toISOString(), // convert date object to iso format
      },
      error: null,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      data: null,
      error: "INTERNAL_SERVER_ERROR",
    });
  }
});
