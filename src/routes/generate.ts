import { Router, type Request, type Response } from "express";
import { generateRequestSchema } from "../validators/input.js";
import { parsePrompt } from "../core/parser.js";
import { compose } from "../core/composer.js";
import { analyzeImage, imageToConfig } from "../image/analyzer.js";
import { getSupportedTypes } from "../blueprints/registry.js";
import type { GenerateRequest, GenerateResponse } from "../types/index.js";
import { ZodError } from "zod";

const router = Router();

router.post("/generate", async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = generateRequestSchema.parse(req.body) as GenerateRequest;

    const componentConfig = parsePrompt(parsed.prompt);

    let analysisResult = null;
    if (parsed.image) {
      analysisResult = await analyzeImage(parsed.image);
      if (analysisResult) {
        const imageConfig = imageToConfig(analysisResult);
        Object.assign(componentConfig, imageConfig);
      }
    }

    const result = compose(componentConfig);

    const response: any = {
      success: true,
      data: result,
    };

    if (analysisResult) {
      response.analysis = {
        type: analysisResult.suggestedType,
        colors: analysisResult.dominantColors,
        palette: analysisResult.palette,
        layout: analysisResult.layout,
        dimensions: `${analysisResult.width}x${analysisResult.height}`,
        darkMode: analysisResult.hasDarkBg,
        regions: analysisResult.regionCount,
      };
    }

    res.json(response);
  } catch (err: unknown) {
    if (err instanceof ZodError) {
      const response: GenerateResponse = {
        success: false,
        error: {
          message: err.errors.map((e) => e.message).join("; "),
          code: "VALIDATION_ERROR",
        },
      };
      res.status(400).json(response);
      return;
    }

    const message = err instanceof Error ? err.message : "An unexpected error occurred";
    console.error("Generation error:", message);

    const response: GenerateResponse = {
      success: false,
      error: { message, code: "INTERNAL_ERROR" },
    };
    res.status(500).json(response);
  }
});

router.get("/types", (_req: Request, res: Response) => {
  res.json({ types: getSupportedTypes() });
});

export default router;
