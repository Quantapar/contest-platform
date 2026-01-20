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
  correctOptionIndex: z.number(),
  points: z.number(),
});

export const submitMcqSchema = z.object({
  selectedOptionIndex: z.number(),
});
