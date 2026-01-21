import z from "zod";

export const createContestsSchema = z.object({
  title: z.string(),
  description: z.string(),
  startTime: z.iso.datetime(),
  endTime: z.iso.datetime(),
});

export const createMcqSchema = z.object({
  questionText: z.string(),
  options: z.string().array(),
  correctOptionIndex: z.number().int().nonnegative(),
  points: z.number(),
});

export const submitMcqSchema = z.object({
  selectedOptionIndex: z.number(),
});

export const createDsaSchema = z.object({
  title: z.string(),
  description: z.string(),
  tags: z.string().array(),
  points: z.number(),
  timeLimit: z.number(),
  memoryLimit: z.number(),
  testCases: z.array(
    z.object({
      input: z.string(),
      expectedOutput: z.string(),
      isHidden: z.boolean(),
    }),
  ),
});
