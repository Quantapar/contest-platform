import express from "express";
export const authRouter = express.Router();
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";
import { tokenValidation } from "../middleware/token";
import { loginSchema, signupSchema } from "../validator/authValidator";
const secret = process.env.SECRET_KEY ?? "aaa";

authRouter.post("/signup", async (req, res) => {
  try {
    const data = signupSchema.safeParse(req.body);
    if (!data.success) {
      return res.status(400).json({
        success: false,
        data: null,
        error: "INVALID_REQUEST",
      });
    }

    const { name, email, password, role } = data.data;
    const finalRole = role ?? "contestee";
    const hashedPassword = await bcrypt.hash(password, 10);

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        data: null,
        error: "EMAIL_ALREADY_EXISTS",
      });
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: finalRole,
      },
    });

    const token = jwt.sign({ id: user.id, role: user.role }, secret, {
      expiresIn: "30d",
    });

    return res.status(201).json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: token,
      },
      error: null,
    });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({
      success: false,
      data: null,
      error: "INTERNAL_SERVER_ERROR",
    });
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const data = loginSchema.safeParse(req.body);
    if (!data.success) {
      return res.status(400).json({
        success: false,
        data: null,
        error: "INVALID_REQUEST",
      });
    }
    const { email, password } = data.data;
    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      return res.status(401).json({
        success: false,
        data: null,
        error: "INVALID_CREDENTIALS",
      });
    }
    const compare = await bcrypt.compare(password, user.password);
    if (!compare) {
      return res.status(401).json({
        success: false,
        data: null,
        error: "INVALID_CREDENTIALS",
      });
    }
    const token = jwt.sign({ id: user.id, role: user.role }, secret, {
      expiresIn: "30d",
    });
    return res.status(200).json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: token,
      },
      error: null,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      data: null,
      error: "INTERNAL_SERVER_ERROR",
    });
  }
});

authRouter.get("/me", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        data: null,
        error: "UNAUTHORIZED",
      });
    }

    const decoded = jwt.verify(token, secret) as { id: number; role: string };
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        data: null,
        error: "USER_NOT_FOUND",
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
      error: null,
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      data: null,
      error: "INVALID_TOKEN",
    });
  }
});

authRouter.get("/stats", tokenValidation, async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        data: null,
        error: "UNAUTHORIZED",
      });
    }

    let contestCount = 0;
    let submissionCount = 0;

    if (req.role === "creator") {
      contestCount = await prisma.contest.count({
        where: { creatorId: userId },
      });

      submissionCount = await prisma.dsaSubmission.count({
        where: { problem: { contest: { creatorId: userId } } },
      });
      const mcqSubmissionCount = await prisma.mcqSubmission.count({
        where: { question: { contest: { creatorId: userId } } },
      });
      submissionCount += mcqSubmissionCount;
    } else {
      const [mcqContests, dsaContests] = await Promise.all([
        prisma.mcqSubmission.findMany({
          where: { userId: userId },
          select: { question: { select: { contestId: true } } },
          distinct: ["questionId"],
        }),
        prisma.dsaSubmission.findMany({
          where: { userId: userId },
          select: { problem: { select: { contestId: true } } },
          distinct: ["problemId"],
        }),
      ]);

      const uniqueContestIds = new Set([
        ...mcqContests.map((s) => s.question.contestId),
        ...dsaContests.map((s) => s.problem.contestId),
      ]);
      contestCount = uniqueContestIds.size;
      submissionCount = mcqContests.length + dsaContests.length;
    }

    return res.status(200).json({
      success: true,
      data: {
        contests: contestCount,
        submissions: submissionCount,
      },
      error: null,
    });
  } catch (error) {
    console.error("Get user stats error:", error);
    return res.status(500).json({
      success: false,
      data: null,
      error: "INTERNAL_SERVER_ERROR",
    });
  }
});
