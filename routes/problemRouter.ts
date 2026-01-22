import express from "express";
export const problemRouter = express.Router();
import { prisma } from "../lib/prisma";
import { tokenValidation } from "../middleware/token";
import { submitDsaSchema } from "../validator/contestsValidator";
import { languageList } from "../lib/judge0Setup";
import type { Judge0PollResponse } from "../types/judge0Types";

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
      return res
        .status(404)
        .json({ success: false, data: null, error: "PROBLEM_NOT_FOUND" });
    }

    const parsed = submitDsaSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ success: false, data: null, error: "INVALID_REQUEST" });
    }

    const { code, language } = parsed.data;
    const languageId = languageList[language];

    if (!languageId) {
      return res
        .status(400)
        .json({ success: false, data: null, error: "INVALID_REQUEST" });
    }

    const problem = await prisma.dsaProblem.findUnique({
      where: { id: problemId },
      include: { testCases: true, contest: true },
    });

    if (!problem) {
      return res
        .status(404)
        .json({ success: false, data: null, error: "PROBLEM_NOT_FOUND" });
    }

    if (problem.contest.creatorId === req.userId) {
      return res
        .status(403)
        .json({ success: false, data: null, error: "FORBIDDEN" });
    }

    const now = new Date();
    if (now < problem.contest.startTime || now > problem.contest.endTime) {
      return res
        .status(400)
        .json({ success: false, data: null, error: "CONTEST_NOT_ACTIVE" });
    }

    const submissions = problem.testCases.map((tc) => ({
      language_id: languageId,
      source_code: code,
      stdin: tc.input,
    }));

    const response = await fetch(
      `${process.env.JUDGE0_API}/submissions/batch?base64_encoded=false&wait=false`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissions }),
      },
    );

    const judge0Result = await response.text();
    if (!response.ok) {
      throw new Error("Judge0 error");
    }

    const tokens = (JSON.parse(judge0Result) as { token: string }[]).map(
      (t) => t.token,
    );

    const submission = await prisma.dsaSubmission.create({
      data: {
        userId: req.userId!,
        problemId,
        code,
        language,
        tokens,
        status: "processing",
        totalTestCases: tokens.length,
      },
    });

    return res.status(201).json({
      success: true,
      data: {
        submissionId: submission.id,
        status: "processing",
      },
      error: null,
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ success: false, data: null, error: "INTERNAL_SERVER_ERROR" });
  }
});

// get request - to poll from judge0 with token
problemRouter.get(
  "/submission/:submissionId",
  tokenValidation,
  async (req, res) => {
    try {
      const submissionId = Number(req.params.submissionId);

      const submission = await prisma.dsaSubmission.findUnique({
        where: { id: submissionId },
        include: { problem: true },
      });

      if (!submission) {
        return res
          .status(404)
          .json({ success: false, data: null, error: "SUBMISSION_NOT_FOUND" });
      }

      if (submission.userId !== req.userId) {
        return res
          .status(403)
          .json({ success: false, data: null, error: "FORBIDDEN" });
      }

      if (submission.status !== "processing") {
        return res.json({
          success: true,
          data: submission,
          error: null,
        });
      }

      const tokens = submission.tokens as string[];

      const pollRes = await fetch(
        `${process.env.JUDGE0_API}/submissions/batch?tokens=${tokens.join(",")}&base64_encoded=false`,
      );

      const pollData = (await pollRes.json()) as Judge0PollResponse;
      const results = pollData.submissions;

      const stillRunning = results.some(
        (r: any) => r.status.id === 1 || r.status.id === 2,
      );

      if (stillRunning) {
        return res.json({
          success: true,
          data: { status: "processing" },
          error: null,
        });
      }

      const total = results.length;
      const passed = results.filter((r: any) => r.status.id === 3).length;

      let status = "wrong_answer";
      if (results.some((r: any) => r.status.id === 6)) {
        status = "runtime_error";
      } else if (results.some((r: any) => r.status.id === 5)) {
        status = "time_limit_exceeded";
      } else if (passed === total) {
        status = "accepted";
      }

      const pointsEarned = Math.floor(
        (passed / total) * submission.problem.points,
      );

      await prisma.dsaSubmission.update({
        where: { id: submissionId },
        data: {
          status,
          pointsEarned,
          testCasesPassed: passed,
        },
      });

      return res.json({
        success: true,
        data: {
          status,
          pointsEarned,
          testCasesPassed: passed,
          totalTestCases: total,
        },
        error: null,
      });
    } catch (err) {
      console.error(err);
      return res
        .status(500)
        .json({ success: false, data: null, error: "INTERNAL_SERVER_ERROR" });
    }
  },
);
