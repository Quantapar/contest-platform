import express from "express";
export const contestsRouter = express.Router();
import { prisma } from "../lib/prisma";
import { tokenValidation } from "../middleware/token";
import {
  createContestsSchema,
  createMcqSchema,
  submitMcqSchema,
} from "../validator/contestsValidator";

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

// get contest with it's mcqs and dsa problems using contest id
contestsRouter.get("/:contestId", tokenValidation, async (req, res) => {
  try {
    const contestId = parseInt(req.params.contestId as string); // it is stored as int in db , so we have to make it number

    if (contestId <= 0) {
      return res.status(400).json({
        success: false,
        data: null,
        error: "INVALID_REQUEST",
      });
    }

    const contest = await prisma.contest.findUnique({
      where: { id: contestId },
      include: {
        mcqs: {
          select: {
            id: true,
            questionText: true,
            options: true,
            points: true,
          },
        },
        dsaProblems: {
          select: {
            id: true,
            title: true,
            description: true,
            tags: true,
            points: true,
            timeLimit: true,
            memoryLimit: true,
          },
        },
      },
    });
    if (!contest) {
      return res.status(404).json({
        success: false,
        data: null,
        error: "CONTEST_NOT_FOUND",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        id: contest.id,
        title: contest.title,
        description: contest.description,
        startTime: contest.startTime.toISOString(),
        endTime: contest.endTime.toISOString(),
        creatorId: contest.creatorId,
        mcqs: contest.mcqs,
        dsaProblems: contest.dsaProblems,
      },
      error: null,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, data: null, error: "INTERNAL_SERVER_ERROR" });
  }
});

// to create mcq in a contest - creator only
contestsRouter.post("/:contestId/mcq", tokenValidation, async (req, res) => {
  try {
    const contestId = parseInt(req.params.contestId as string);

    if (contestId <= 0) {
      return res.status(400).json({
        success: false,
        data: null,
        error: "INVALID_REQUEST",
      });
    }
    const role = req.role;
    if (role !== "creator") {
      return res.status(403).json({
        success: false,
        data: null,
        error: "FORBIDDEN",
      });
    }
    const data = createMcqSchema.safeParse(req.body);
    if (!data.success) {
      return res.status(400).json({
        success: false,
        data: null,
        error: "INVALID_REQUEST",
      });
    }

    const contest = await prisma.contest.findUnique({
      where: { id: contestId },
    });
    if (!contest) {
      return res.status(404).json({
        success: false,
        data: null,
        error: "CONTEST_NOT_FOUND",
      });
    }
    const { questionText, options, correctOptionIndex, points } = data.data;

    const mcq = await prisma.mcqQuestion.create({
      data: {
        contestId,
        questionText,
        options,
        correctOptionIndex,
        points,
      },
    });
    return res.status(201).json({
      success: true,
      data: {
        id: mcq.id,
        contestId: mcq.contestId,
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

contestsRouter.post(
  "/:contestId/mcq/:questionId/submit",
  tokenValidation,
  async (req, res) => {},
);
