import z from "zod";

export const createContestsSchema = z.object({
  title: z.string(),
  description: z.string(),
  startTime: z.iso.datetime(),
  endTime: z.iso.datetime(),
});
