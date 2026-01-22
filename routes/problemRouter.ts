import express from "express";
export const problemRouter = express.Router();
import { prisma } from "../lib/prisma";
import { tokenValidation } from "../middleware/token";
import { submitDsaSchema } from "../validator/contestsValidator";
import { languageList } from "../lib/judge0Languages";

problemRouter.get("/:problemId", tokenValidation, async (req, res) => {
  try {
    const problemId = Number(req.params.problemId);
    if (!problemId) {
      return res.status(404).json({
        success: false,
        data: null,
        error: "PROBLEM_NOT_FOUND",
      });
    }

    const problem = await prisma.dsaProblem.findUnique({
      where: { id: problemId },
      include: {
        testCases: {
          where: { isHidden: false },
          select: {
            input: true,
            expectedOutput: true,
          },
        },
      },
    });

    if (!problem) {
      return res.status(404).json({
        success: false,
        data: null,
        error: "PROBLEM_NOT_FOUND",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        id: problem.id,
        contestId: problem.contestId,
        title: problem.title,
        description: problem.description,
        tags: problem.tags,
        points: problem.points,
        timeLimit: problem.timeLimit,
        memoryLimit: problem.memoryLimit,
        visibleTestCases: problem.testCases,
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

// problem submit route- using judge0
problemRouter.post("/:problemId/submit", tokenValidation, async (req, res) => {
  try {
    const problemId = Number(req.params.problemId);
    if (!problemId) {
      return res.status(404).json({
        success: false,
        data: null,
        error: "PROBLEM_NOT_FOUND",
      });
    }

    const parsed = submitDsaSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        data: null,
        error: "INVALID_REQUEST",
      });
    }

    const { code, language } = parsed.data;

    const languageId = languageList[language];
    if (!languageId) {
      return res.status(400).json({
        success: false,
        data: null,
        error: "INVALID_REQUEST",
      });
    }

    const problem = await prisma.dsaProblem.findUnique({
      where: { id: problemId },
      include: {
        testCases: true,
        contest: true,
      },
    });

    if (!problem) {
      return res.status(404).json({
        success: false,
        data: null,
        error: "PROBLEM_NOT_FOUND",
      });
    }

    if (problem.contest.creatorId === req.userId) {
      return res.status(403).json({
        success: false,
        data: null,
        error: "FORBIDDEN",
      });
    }

    const now = new Date();
    if (now < problem.contest.startTime || now > problem.contest.endTime) {
      return res.status(400).json({
        success: false,
        data: null,
        error: "CONTEST_NOT_ACTIVE",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      data: null,
      error: "INTERNAL_SERVER_ERROR",
    });
  }
});
