import { z } from "zod";
import { config } from "../config.js";

const base64ImageRegex = /^data:image\/(png|jpeg|jpg|gif|webp);base64,/;

export const generateRequestSchema = z.object({
  prompt: z
    .string({ required_error: "prompt is required" })
    .min(1, "prompt cannot be empty")
    .max(5000, "prompt too long (max 5000 chars)"),
  image: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val) return true;
        return base64ImageRegex.test(val);
      },
      { message: "image must be a valid base64 data URI (png/jpeg/gif/webp)" }
    )
    .refine(
      (val) => {
        if (!val) return true;
        const sizeBytes = (val.length * 3) / 4;
        return sizeBytes <= config.maxImageSizeMb * 1024 * 1024;
      },
      { message: `image exceeds ${config.maxImageSizeMb}MB limit` }
    ),
});
