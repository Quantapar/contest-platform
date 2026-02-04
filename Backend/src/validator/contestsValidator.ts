import z from "zod";

export const createContestsSchema = z.object({
  title: z.string(),
  description: z.string(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
});

export const createMcqSchema = z.object({
  questionText: z.string(),
  options: z.array(z.string()).min(2),
  correctOptionIndex: z.number().int().nonnegative(),
  points: z.number(),
});

export const submitMcqSchema = z.object({
  selectedOptionIndex: z.number().int().nonnegative(),
});

export const createDsaSchema = z.object({
  title: z.string(),
  description: z.string(),
  tags: z.string().array(),
  points: z.number(),
  timeLimit: z.number(),
  memoryLimit: z.number(),
  testCases: z
    .array(
      z.object({
        input: z.string(),
        expectedOutput: z.string(),
        isHidden: z.boolean(),
      }),
    )
    .min(1),
});

export const submitDsaSchema = z.object({
  code: z.string().nonempty(),
  language: z.enum(["javascript", "python", "cpp", "c", "java", "typescript"]),
});
