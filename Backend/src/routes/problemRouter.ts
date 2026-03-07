import express from "express";
export const problemRouter = express.Router();
import { prisma } from "../lib/prisma";
import { tokenValidation } from "../middleware/token";
import { submitDsaSchema } from "../validator/contestsValidator";
import { languageList } from "../lib/judge0Setup";
import type { Judge0PollResponse } from "../types/judge0Types";

const JUDGE0_STATUS = {
  IN_QUEUE: 1,
  PROCESSING: 2,
  ACCEPTED: 3,
  WRONG_ANSWER: 4,
  TIME_LIMIT_EXCEEDED: 5,
  COMPILATION_ERROR: 6,
  RUNTIME_ERROR_MIN: 7,
  RUNTIME_ERROR_MAX: 12,
  INTERNAL_ERROR: 13,
  EXEC_FORMAT_ERROR: 14,
} as const;

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

    const isCreator = problem.contest.creatorId === req.userId;
    const now = new Date();
    const isActive =
      now >= problem.contest.startTime && now <= problem.contest.endTime;

    if (!isCreator && !isActive) {
      return res
        .status(400)
        .json({ success: false, data: null, error: "CONTEST_NOT_ACTIVE" });
    }

    const allSubmissions = problem.testCases.map((tc) => ({
      language_id: languageId,
      source_code: Buffer.from(code).toString("base64"),
      stdin: Buffer.from(tc.input).toString("base64"),
      expected_output: Buffer.from(tc.expectedOutput.trimEnd()).toString(
        "base64",
      ),
    }));

    const batchSize = 20;
    const tokens: string[] = [];

    for (let i = 0; i < allSubmissions.length; i += batchSize) {
      const chunk = allSubmissions.slice(i, i + batchSize);

      const response = await fetch(
        `${process.env.JUDGE0_API}/submissions/batch?base64_encoded=true&wait=false`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ submissions: chunk }),
        },
      );

      const judge0Result = await response.text();
      console.log(`Judge0 Chunk ${i / batchSize + 1} Response:`, judge0Result);

      if (!response.ok) {
        throw new Error(`Judge0 error (${response.status}): ${judge0Result}`);
      }

      let parsedResult;
      try {
        parsedResult = JSON.parse(judge0Result);
      } catch (e) {
        throw new Error("Invalid response from Judge0");
      }

      if (!Array.isArray(parsedResult)) {
        throw new Error(`Judge0 returned unexpected format: ${judge0Result}`);
      }

      tokens.push(...parsedResult.map((t: any) => t.token));
    }

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
  } catch (err: any) {
    console.error("Submission Error:", err);
    return res.status(500).json({
      success: false,
      data: null,
      error:
        err instanceof Error
          ? err.message
          : String(err) || "INTERNAL_SERVER_ERROR",
    });
  }
});

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
      const batchSize = 20;
      const results: any[] = [];

      for (let i = 0; i < tokens.length; i += batchSize) {
        const chunk = tokens.slice(i, i + batchSize);
        const pollRes = await fetch(
          `${process.env.JUDGE0_API}/submissions/batch?tokens=${chunk.join(",")}&base64_encoded=true&fields=token,stdout,expected_output,status,stderr,compile_output,message`,
        );

        if (!pollRes.ok) {
          const errorBody = await pollRes.text();
          console.error("Judge0 poll error:", pollRes.status, errorBody);
          throw new Error(
            `Judge0 poll error (${pollRes.status}): ${errorBody}`,
          );
        }

        const pollData = (await pollRes.json()) as Judge0PollResponse;
        results.push(...pollData.submissions);
      }

      const stillRunning = results.some(
        (r: any) =>
          r.status.id === JUDGE0_STATUS.IN_QUEUE ||
          r.status.id === JUDGE0_STATUS.PROCESSING,
      );

      if (stillRunning) {
        return res.json({
          success: true,
          data: { status: "processing" },
          error: null,
        });
      }

      const total = results.length;
      const passed = results.filter(
        (r: any) => r.status.id === JUDGE0_STATUS.ACCEPTED,
      ).length;

      // Debug logging for failures
      results.forEach((r: any) => {
        if (r.status.id === JUDGE0_STATUS.WRONG_ANSWER) {
          // Wrong Answer
          try {
            const stdout = r.stdout
              ? Buffer.from(r.stdout, "base64").toString()
              : "(null)";
            const expected = r.expected_output
              ? Buffer.from(r.expected_output, "base64").toString()
              : "(null)";
            console.log(`[DEBUG] WA Detail - Token: ${r.token}`);
            console.log(
              `Expected (len=${expected.length}): ${JSON.stringify(expected)}`,
            );
            console.log(
              `Actual   (len=${stdout.length}): ${JSON.stringify(stdout)}`,
            );
          } catch (e) {
            console.error("Error decoding debug info", e);
          }
        }
      });

      let status = "wrong_answer";
      if (
        results.some(
          (r: any) =>
            r.status.id === JUDGE0_STATUS.INTERNAL_ERROR ||
            r.status.id === JUDGE0_STATUS.EXEC_FORMAT_ERROR,
        )
      ) {
        status = "judge_error";
      } else if (
        results.some(
          (r: any) => r.status.id === JUDGE0_STATUS.COMPILATION_ERROR,
        )
      ) {
        status = "compilation_error";
      } else if (
        results.some(
          (r: any) =>
            r.status.id >= JUDGE0_STATUS.RUNTIME_ERROR_MIN &&
            r.status.id <= JUDGE0_STATUS.RUNTIME_ERROR_MAX,
        )
      ) {
        status = "runtime_error";
      } else if (
        results.some(
          (r: any) => r.status.id === JUDGE0_STATUS.TIME_LIMIT_EXCEEDED,
        )
      ) {
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
