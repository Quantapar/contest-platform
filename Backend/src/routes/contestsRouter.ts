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

contestsRouter.get("/", tokenValidation, async (req, res) => {
  try {
    const contests = await prisma.contest.findMany({
      orderBy: {
        startTime: "desc",
      },
      include: {
        creator: {
          select: {
            name: true,
          },
        },
      },
    });

    return res.status(200).json({
      success: true,
      data: contests.map((contest) => ({
        id: contest.id,
        title: contest.title,
        description: contest.description,
        startTime: contest.startTime.toISOString(),
        endTime: contest.endTime.toISOString(),
        creatorId: contest.creatorId,
        creatorName: contest.creator.name,
      })),
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

contestsRouter.get("/my", tokenValidation, async (req, res) => {
  try {
    const userId = req.userId;
    const contests = await prisma.contest.findMany({
      where: {
        creatorId: Number(userId),
      },
      orderBy: {
        startTime: "desc",
      },
      include: {
        creator: {
          select: {
            name: true,
          },
        },
      },
    });

    return res.status(200).json({
      success: true,
      data: contests.map((contest) => ({
        id: contest.id,
        title: contest.title,
        description: contest.description,
        startTime: contest.startTime.toISOString(),
        endTime: contest.endTime.toISOString(),
        creatorId: contest.creatorId,
        creatorName: contest.creator.name,
      })),
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
        startTime: contest.startTime.toISOString(),
        endTime: contest.endTime.toISOString(),
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

contestsRouter.get("/:contestId", tokenValidation, async (req, res) => {
  try {
    const contestId = Number(req.params.contestId);

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

    const [mcqSubmissions, dsaSubmissions] = await Promise.all([
      prisma.mcqSubmission.findMany({
        where: {
          userId: req.userId!,
          questionId: { in: contest.mcqs.map((m) => m.id) },
        },
      }),
      prisma.dsaSubmission.findMany({
        where: {
          userId: req.userId!,
          problemId: { in: contest.dsaProblems.map((d) => d.id) },
        },
        orderBy: { pointsEarned: "desc" },
      }),
    ]);

    const userMcqSubMap = new Map(mcqSubmissions.map((s) => [s.questionId, s]));
    const userDsaSubMap = new Map();
    dsaSubmissions.forEach((s) => {
      if (!userDsaSubMap.has(s.problemId)) {
        userDsaSubMap.set(s.problemId, s);
      }
    });

    return res.status(200).json({
      success: true,
      data: {
        id: contest.id,
        title: contest.title,
        description: contest.description,
        startTime: contest.startTime.toISOString(),
        endTime: contest.endTime.toISOString(),
        creatorId: contest.creatorId,
        mcqs: contest.mcqs.map((m) => ({
          ...m,
          userSubmission: userMcqSubMap.get(m.id) || null,
        })),
        dsaProblems: contest.dsaProblems.map((d) => ({
          ...d,
          userSubmission: userDsaSubMap.get(d.id) || null,
        })),
      },
      error: null,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, data: null, error: "INTERNAL_SERVER_ERROR" });
  }
});

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

      const isCreator = contest.creatorId === req.userId;

      const now = new Date();
      const isActive = now >= contest.startTime && now <= contest.endTime;

      if (!isCreator && !isActive) {
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

      const isCorrect = selectedOptionIndex === question.correctOptionIndex;
      const pointsEarned = isCorrect ? question.points : 0;

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


contestsRouter.delete(
  "/:contestId/mcq/:mcqId",
  tokenValidation,
  async (req, res) => {
    try {
      const { contestId, mcqId } = req.params;
      const userId = req.userId;

      const contest = await prisma.contest.findUnique({
        where: { id: Number(contestId) },
      });

      if (!contest || contest.creatorId !== userId) {
        return res.status(403).json({ success: false, error: "FORBIDDEN" });
      }

      await prisma.mcqSubmission.deleteMany({
        where: { questionId: Number(mcqId) },
      });

      await prisma.mcqQuestion.delete({
        where: { id: Number(mcqId) },
      });

      return res.status(200).json({ success: true });
    } catch (error) {
      return res
        .status(500)
        .json({ success: false, error: "INTERNAL_SERVER_ERROR" });
    }
  },
);

contestsRouter.delete(
  "/:contestId/dsa/:dsaId",
  tokenValidation,
  async (req, res) => {
    try {
      const { contestId, dsaId } = req.params;
      const userId = req.userId;

      const contest = await prisma.contest.findUnique({
        where: { id: Number(contestId) },
      });

      if (!contest || contest.creatorId !== userId) {
        return res.status(403).json({ success: false, error: "FORBIDDEN" });
      }

      await prisma.testCase.deleteMany({
        where: { problemId: Number(dsaId) },
      });
      await prisma.dsaSubmission.deleteMany({
        where: { problemId: Number(dsaId) },
      });

      await prisma.dsaProblem.delete({
        where: { id: Number(dsaId) },
      });

      return res.status(200).json({ success: true });
    } catch (error) {
      return res
        .status(500)
        .json({ success: false, error: "INTERNAL_SERVER_ERROR" });
    }
  },
);
