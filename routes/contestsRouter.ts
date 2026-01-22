import express from "express";
export const contestsRouter = express.Router();
import { prisma } from "../lib/prisma";
import { tokenValidation } from "../middleware/token";
import {
  createContestsSchema,
  createMcqSchema,
  submitMcqSchema,
  createDsaSchema,
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
    const contestId = Number(req.params.contestId); // it is stored as int in db , so we have to make it number

    if (!contestId) {
      return res.status(404).json({
        success: false,
        data: null,
        error: "CONTEST_NOT_FOUND",
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
    const contestId = Number(req.params.contestId);

    if (!contestId) {
      return res.status(404).json({
        success: false,
        data: null,
        error: "CONTEST_NOT_FOUND",
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
    if (correctOptionIndex >= options.length) {
      return res.status(400).json({
        success: false,
        data: null,
        error: "INVALID_REQUEST",
      });
    }

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

// submit mcq solution using contestId and mcqId
contestsRouter.post(
  "/:contestId/mcq/:questionId/submit",
  tokenValidation,
  async (req, res) => {
    try {
      const contestId = Number(req.params.contestId);
      const questionId = Number(req.params.questionId);

      if (!contestId) {
        return res.status(404).json({
          success: false,
          data: null,
          error: "CONTEST_NOT_FOUND",
        });
      }

      if (!questionId) {
        return res.status(404).json({
          success: false,
          data: null,
          error: "QUESTION_NOT_FOUND",
        });
      }

      const data = submitMcqSchema.safeParse(req.body);
      if (!data.success) {
        return res.status(400).json({
          success: false,
          data: null,
          error: "INVALID_REQUEST",
        });
      }
      const { selectedOptionIndex } = data.data;

      const contest = await prisma.contest.findUnique({
        where: { id: contestId },
      });

      if (!contest) {
        return res.status(404).json({
          success: false,
          data: null,
          error: "QUESTION_NOT_FOUND",
        });
      }

      if (contest.creatorId === req.userId) {
        return res.status(403).json({
          success: false,
          data: null,
          error: "FORBIDDEN",
        });
      }

      const now = new Date();
      if (now < contest.startTime || now > contest.endTime) {
        return res.status(400).json({
          success: false,
          data: null,
          error: "CONTEST_NOT_ACTIVE",
        });
      }

      const question = await prisma.mcqQuestion.findFirst({
        where: {
          id: questionId,
          contestId,
        },
      });

      if (!question) {
        return res.status(404).json({
          success: false,
          data: null,
          error: "QUESTION_NOT_FOUND",
        });
      }

      const alreadySubmitted = await prisma.mcqSubmission.findUnique({
        where: {
          userId_questionId: {
            userId: req.userId!,
            questionId,
          },
        },
      });

      if (alreadySubmitted) {
        return res.status(400).json({
          success: false,
          data: null,
          error: "ALREADY_SUBMITTED",
        });
      }

      const isCorrect = selectedOptionIndex === question.correctOptionIndex; // checking the ans
      const pointsEarned = isCorrect ? question.points : 0; // points earned

      await prisma.mcqSubmission.create({
        data: {
          userId: req.userId!,
          questionId,
          selectedOptionIndex,
          isCorrect,
          pointsEarned,
        },
      });
      return res.status(201).json({
        success: true,
        data: {
          isCorrect,
          pointsEarned,
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
  },
);

// add dsa problem to contest - only creator can do that
contestsRouter.post("/:contestId/dsa", tokenValidation, async (req, res) => {
  try {
    const role = req.role;
    if (role != "creator") {
      return res.status(403).json({
        success: false,
        data: null,
        error: "FORBIDDEN",
      });
    }

    const data = createDsaSchema.safeParse(req.body);
    if (!data.success) {
      return res.status(400).json({
        success: false,
        data: null,
        error: "INVALID_REQUEST",
      });
    }
    const contestId = Number(req.params.contestId);
    if (!contestId) {
      return res.status(404).json({
        success: false,
        data: null,
        error: "CONTEST_NOT_FOUND",
      });
    }
    const {
      title,
      description,
      tags,
      points,
      timeLimit,
      memoryLimit,
      testCases,
    } = data.data;
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

    const dsa = await prisma.dsaProblem.create({
      data: {
        contestId,
        title,
        description,
        tags,
        points,
        timeLimit,
        memoryLimit,
        testCases: {
          create: testCases.map((tc) => ({
            input: tc.input,
            expectedOutput: tc.expectedOutput,
            isHidden: tc.isHidden ?? false,
          })),
        },
      },
    });

    return res.status(201).json({
      success: true,
      data: {
        id: dsa.id,
        contestId: dsa.contestId,
      },
      error: null,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, data: null, error: "INTERNAL_SERVER_ERROR" });
  }
});
