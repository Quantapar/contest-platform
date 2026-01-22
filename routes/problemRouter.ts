import express from "express";
export const problemRouter = express.Router();
import { prisma } from "../lib/prisma";
import { tokenValidation } from "../middleware/token";
import { submitDsaSchema } from "../validator/contestsValidator";
import { languageList } from "../lib/judge0Setup";
import type {
  Judge0BatchResponse,
  Judge0PollResponse,
} from "../types/judge0Types";

// to get dsa problem using it's id
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

    // sending post request to judge0
    const submission = problem?.testCases.map((t) => ({
      language_id: languageId,
      source_code: code,
      stdin: t.input,
      expected_output: t.expectedOutput,
    }));

    const judge0Result = await fetch(
      `${process.env.JUDGE0_API}/submissions/batch?base64_encoded=false`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          submissions: submission,
        }),
      },
    );
    if (!judge0Result.ok) {
      return res.status(500).json({
        success: false,
        data: null,
        error: "INTERNAL_SERVER_ERROR",
      });
    }

    const judge0Data = (await judge0Result.json()) as Judge0BatchResponse;
    const tokens = judge0Data.map((t) => t.token);
    const finalResult = setInterval(async () => {
      try {
        const pollRes = await fetch(
          `${process.env.JUDGE0_API}/submissions/batch?tokens=${tokens.join(",")}&base64_encoded=false`,
        );

        const pollData = (await pollRes.json()) as Judge0PollResponse;
        const results = pollData.submissions;
        const stillRunning = results.some(
          (r) => r.status.id === 1 || r.status.id === 2,
        );
        if (stillRunning) {
          return;
        }
        clearInterval(finalResult);
        const totalTestCases = results.length;
        const testCasesPassed = results.filter((r) => r.status.id === 3).length;

        let status:
          | "accepted"
          | "wrong_answer"
          | "time_limit_exceeded"
          | "runtime_error";

        if (results.some((r) => r.status.id === 6)) {
          status = "runtime_error";
        } else if (results.some((r) => r.status.id === 5)) {
          status = "time_limit_exceeded";
        } else if (testCasesPassed === totalTestCases) {
          status = "accepted";
        } else {
          status = "wrong_answer";
        }

        const pointsEarned = Math.floor(
          (testCasesPassed / totalTestCases) * problem.points,
        );
        return res.status(201).json({
          success: true,
          data: {
            status,
            pointsEarned,
            testCasesPassed,
            totalTestCases,
          },
          error: null,
        });
      } catch (error) {
        clearInterval(finalResult);
        return res.status(500).json({
          success: false,
          data: null,
          error: "INTERNAL_SERVER_ERROR",
        });
      }
    }, 1000);
  } catch (error) {
    return res.status(500).json({
      success: false,
      data: null,
      error: "INTERNAL_SERVER_ERROR",
    });
  }
});
