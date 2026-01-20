# Contest Platform Backend

A simple contest platform backend where **creators** can create contests (MCQs + DSA problems) and **contestees** can participate, submit answers, and view the leaderboard.

Built with **Bun + TypeScript + Prisma + Neon Postgres**.

---

## Tech Used

- Bun
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT Auth
- bcrypt
- Zod

---

## Endpoints

- POST `/api/auth/signup`
- POST `/api/auth/login`
- POST `/api/contests` _(creator)_
- GET `/api/contests/:contestId`
- POST `/api/contests/:contestId/mcq` _(creator)_
- POST `/api/contests/:contestId/mcq/:questionId/submit` _(contestee)_
- POST `/api/contests/:contestId/dsa` _(creator)_
- GET `/api/problems/:problemId`
- POST `/api/problems/:problemId/submit` _(contestee)_
- GET `/api/contests/:contestId/leaderboard`
