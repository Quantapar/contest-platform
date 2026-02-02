import express from "express";
export const authRouter = express.Router();
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";
import { loginSchema, signupSchema } from "../validator/authValidator";
const secret = process.env.SECRET_KEY ?? "aaa";

// signup route
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
    return res.status(201).json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
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

//login route
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
        token: token,
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
