import { Jimp } from "jimp";
import type { ComponentConfig } from "../types/index.js";

interface ColorCluster {
  r: number;
  g: number;
  b: number;
  count: number;
}

interface LayoutRegion {
  type: "header" | "sidebar" | "content" | "footer" | "card" | "nav" | "divider";
  x: number;
  y: number;
  width: number;
  height: number;
  bgColor: string;
}

export interface ImageAnalysisResult {
  dominantColors: string[];
  palette: { bg: string; text: string; accent: string; border: string };
  width: number;
  height: number;
  aspectRatio: number;
  suggestedColor: string;
  suggestedType: string;
  layout: string;
  hasDarkBg: boolean;
  hasGrid: boolean;
  hasForm: boolean;
  hasSidebar: boolean;
  regionCount: number;
}

function euclidean(r1: number, g1: number, b1: number, r2: number, g2: number, b2: number): number {
  return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);
}

function quantizeColor(r: number, g: number, b: number, step = 32): string {
  const qr = Math.round(r / step) * step;
  const qg = Math.round(g / step) * step;
  const qb = Math.round(b / step) * step;
  return `${qr},${qg},${qb}`;
}

function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map((c) => Math.round(c).toString(16).padStart(2, "0")).join("");
}

function rgbToTailwindColor(r: number, g: number, b: number): string {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const sat = max - min;

  if (max < 30) return "dark";
  if (min > 220) return "white";
  if (sat < 20) return max > 180 ? "gray" : "slate";

  const primaries = [
    { name: "red", r: 220, g: 60, b: 60 },
    { name: "orange", r: 240, g: 140, b: 40 },
    { name: "amber", r: 240, g: 190, b: 40 },
    { name: "yellow", r: 230, g: 210, b: 40 },
    { name: "lime", r: 150, g: 200, b: 50 },
    { name: "green", r: 60, g: 180, b: 70 },
    { name: "emerald", r: 40, g: 170, b: 110 },
    { name: "teal", r: 40, g: 160, b: 150 },
    { name: "cyan", r: 40, g: 150, b: 200 },
    { name: "blue", r: 50, g: 120, b: 220 },
    { name: "indigo", r: 80, g: 80, b: 220 },
    { name: "violet", r: 130, g: 70, b: 210 },
    { name: "purple", r: 170, g: 60, b: 190 },
    { name: "pink", r: 210, g: 60, b: 140 },
    { name: "rose", r: 220, g: 60, b: 90 },
  ];

  let closest = "blue";
  let minDist = Infinity;
  for (const p of primaries) {
    const d = euclidean(r, g, b, p.r, p.g, p.b);
    if (d < minDist) {
      minDist = d;
      closest = p.name;
    }
  }
  return closest;
}

function lightness(r: number, g: number, b: number): number {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

function isColorClose(r1: number, g1: number, b1: number, r2: number, g2: number, b2: number, threshold = 40): boolean {
  return euclidean(r1, g1, b1, r2, g2, b2) < threshold;
}

export async function analyzeImage(imageDataUri: string): Promise<ImageAnalysisResult | null> {
  try {
    const buffer = Buffer.from(imageDataUri.replace(/^data:image\/\w+;base64,/, ""), "base64");
    const image = await Jimp.read(buffer);

    const width = image.bitmap.width;
    const height = image.bitmap.height;
    const aspectRatio = width / height;

    // Sample pixels every 8px for analysis
    const sampleStep = Math.max(4, Math.floor(Math.min(width, height) / 100));
    const pixels: { r: number; g: number; b: number; x: number; y: number }[] = [];
    const colorBuckets = new Map<string, ColorCluster>();
    const data = image.bitmap.data;

    for (let y = 0; y < height; y += sampleStep) {
      for (let x = 0; x < width; x += sampleStep) {
        const idx = (y * width + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];

        pixels.push({ r, g, b, x, y });

        const key = quantizeColor(r, g, b);
        const existing = colorBuckets.get(key);
        if (existing) {
          existing.count++;
          existing.r = (existing.r * (existing.count - 1) + r) / existing.count;
          existing.g = (existing.g * (existing.count - 1) + g) / existing.count;
          existing.b = (existing.b * (existing.count - 1) + b) / existing.count;
        } else {
          colorBuckets.set(key, { r, g, b, count: 1 });
        }
      }
    }

    // Sort colors by frequency
    const sortedColors = [...colorBuckets.values()]
      .filter((c) => c.count > pixels.length * 0.005)
      .sort((a, b) => b.count - a.count);

    const topColors = sortedColors.slice(0, 8);

    // Determine background color (most common color, likely bg)
    const bgColor = topColors[0] || { r: 255, g: 255, b: 255 };
    const hasDarkBg = lightness(bgColor.r, bgColor.g, bgColor.b) < 128;

    // Find accent color (most saturated among top colors, excluding bg-like)
    let accentColor = topColors[1] || topColors[0] || { r: 59, g: 130, b: 246 };
    for (const c of topColors) {
      const sat = Math.max(c.r, c.g, c.b) - Math.min(c.r, c.g, c.b);
      if (sat > 40 && !isColorClose(c.r, c.g, c.b, bgColor.r, bgColor.g, bgColor.b, 60)) {
        accentColor = c;
        break;
      }
    }

    // Find text color (high contrast against bg, typically dark-on-light or light-on-dark)
    const textColor = hasDarkBg
      ? topColors.find((c) => lightness(c.r, c.g, c.b) > 200) || { r: 255, g: 255, b: 255 }
      : topColors.find((c) => lightness(c.r, c.g, c.b) < 100) || { r: 30, g: 30, b: 30 };

    // Layout analysis: detect horizontal bands (rows of similar color)
    const rowColors: { y: number; r: number; g: number; b: number; isUniform: boolean }[] = [];
    const rowScanStep = Math.max(2, Math.floor(height / 60));

    for (let y = 0; y < height; y += rowScanStep) {
      const rowSamples: { r: number; g: number; b: number }[] = [];
      for (let x = 0; x < width; x += sampleStep * 2) {
        const idx = (y * width + x) * 4;
        if (idx + 2 < image.bitmap.data.length) {
          rowSamples.push({
            r: image.bitmap.data[idx],
            g: image.bitmap.data[idx + 1],
            b: image.bitmap.data[idx + 2],
          });
        }
      }
      if (rowSamples.length > 0) {
        const avgR = rowSamples.reduce((s, p) => s + p.r, 0) / rowSamples.length;
        const avgG = rowSamples.reduce((s, p) => s + p.g, 0) / rowSamples.length;
        const avgB = rowSamples.reduce((s, p) => s + p.b, 0) / rowSamples.length;
        const variance = rowSamples.reduce((s, p) => s + euclidean(p.r, p.g, p.b, avgR, avgG, avgB), 0) / rowSamples.length;
        rowColors.push({ y, r: avgR, g: avgG, b: avgB, isUniform: variance < 30 });
      }
    }

    // Detect regions (consecutive rows of similar color = one region)
    const regions: { yStart: number; yEnd: number; r: number; g: number; b: number }[] = [];
    if (rowColors.length > 0) {
      let currentRegion = { yStart: rowColors[0].y, yEnd: rowColors[0].y, r: rowColors[0].r, g: rowColors[0].g, b: rowColors[0].b };
      for (let i = 1; i < rowColors.length; i++) {
        const prev = rowColors[i - 1];
        const curr = rowColors[i];
        if (isColorClose(prev.r, prev.g, prev.b, curr.r, curr.g, curr.b, 35)) {
          currentRegion.yEnd = curr.y;
        } else {
          regions.push({ ...currentRegion });
          currentRegion = { yStart: curr.y, yEnd: curr.y, r: curr.r, g: curr.g, b: curr.b };
        }
      }
      regions.push(currentRegion);
    }

    // Detect sidebar: check if left/right columns have distinct color from center
    let hasSidebar = false;
    const sideStripWidth = Math.floor(width * 0.18);
    if (sideStripWidth > 30) {
      const sideSamples: { r: number; g: number; b: number }[] = [];
      const centerSamples: { r: number; g: number; b: number }[] = [];
      for (let y = Math.floor(height * 0.1); y < Math.floor(height * 0.9); y += sampleStep * 2) {
        for (let x = 0; x < sideStripWidth; x += sampleStep) {
          const idx = (y * width + x) * 4;
          if (idx + 2 < image.bitmap.data.length) {
            sideSamples.push({ r: image.bitmap.data[idx], g: image.bitmap.data[idx + 1], b: image.bitmap.data[idx + 2] });
          }
        }
        const cx = Math.floor(width / 2);
        for (let x = cx; x < cx + 20; x += sampleStep) {
          const idx = (y * width + x) * 4;
          if (idx + 2 < image.bitmap.data.length) {
            centerSamples.push({ r: image.bitmap.data[idx], g: image.bitmap.data[idx + 1], b: image.bitmap.data[idx + 2] });
          }
        }
      }
      if (sideSamples.length > 0 && centerSamples.length > 0) {
        const sAvgR = sideSamples.reduce((s, p) => s + p.r, 0) / sideSamples.length;
        const sAvgG = sideSamples.reduce((s, p) => s + p.g, 0) / sideSamples.length;
        const sAvgB = sideSamples.reduce((s, p) => s + p.b, 0) / sideSamples.length;
        const cAvgR = centerSamples.reduce((s, p) => s + p.r, 0) / centerSamples.length;
        const cAvgG = centerSamples.reduce((s, p) => s + p.g, 0) / centerSamples.length;
        const cAvgB = centerSamples.reduce((s, p) => s + p.b, 0) / centerSamples.length;
        hasSidebar = !isColorClose(sAvgR, sAvgG, sAvgB, cAvgR, cAvgG, cAvgB, 50);
      }
    }

    // Detect grid (repeating vertical/horizontal lines)
    let hasGrid = false;
    if (regions.length > 8) {
      const regionHeights = regions.map((r) => r.yEnd - r.yStart);
      const avgHeight = regionHeights.reduce((s, h) => s + h, 0) / regionHeights.length;
      const uniformHeights = regionHeights.filter((h) => Math.abs(h - avgHeight) < avgHeight * 0.3).length;
      hasGrid = uniformHeights > 4;
    }

    // Detect form (many thin alternating rows)
    let hasForm = false;
    if (regions.length > 5) {
      const thinRegions = regions.filter((r) => r.yEnd - r.yStart < height * 0.06);
      hasForm = thinRegions.length > 3;
    }

    // Detect navbar (top region with distinct color)
    let hasNavbar = false;
    if (regions.length > 1) {
      const topRegion = regions[0];
      const topHeight = topRegion.yEnd - topRegion.yStart;
      hasNavbar = topHeight < height * 0.12 && !isColorClose(topRegion.r, topRegion.g, topRegion.b, bgColor.r, bgColor.g, bgColor.b, 30);
    }

    // Determine suggested component type
    let suggestedType = "card";
    if (regions.length >= 6) suggestedType = "page";
    else if (hasNavbar && hasSidebar) suggestedType = "layout";
    else if (hasNavbar && !hasSidebar) suggestedType = "navbar";
    else if (hasGrid) suggestedType = "table";
    else if (hasForm) suggestedType = "form";
    else if (hasSidebar) suggestedType = "layout";
    else if (aspectRatio > 1.8) suggestedType = "navbar";
    else if (aspectRatio < 0.8) suggestedType = "card";
    else if (regions.length <= 3) suggestedType = "card";

    // Determine layout
    let layout = "container";
    if (hasSidebar && hasNavbar) layout = "sidebar";
    else if (hasSidebar) layout = "sidebar";
    else if (hasGrid) layout = "grid";

    const dominantColors = topColors.slice(0, 5).map((c) => rgbToHex(c.r, c.g, c.b));
    const suggestedColor = rgbToTailwindColor(accentColor.r, accentColor.g, accentColor.b);

    return {
      dominantColors,
      palette: {
        bg: rgbToHex(bgColor.r, bgColor.g, bgColor.b),
        text: rgbToHex(textColor.r, textColor.g, textColor.b),
        accent: rgbToHex(accentColor.r, accentColor.g, accentColor.b),
        border: rgbToHex(
          (bgColor.r + textColor.r) / 2,
          (bgColor.g + textColor.g) / 2,
          (bgColor.b + textColor.b) / 2,
        ),
      },
      width,
      height,
      aspectRatio: Math.round(aspectRatio * 100) / 100,
      suggestedColor,
      suggestedType,
      layout,
      hasDarkBg,
      hasGrid,
      hasForm,
      hasSidebar,
      regionCount: regions.length,
    };
  } catch (err) {
    console.error("Image analysis error:", err);
    return null;
  }
}

export function imageToConfig(analysis: ImageAnalysisResult): Partial<ComponentConfig> {
  const config: Partial<ComponentConfig> = {};

  config.color = analysis.suggestedColor as ComponentConfig["color"];

  if (analysis.suggestedType) {
    config.type = analysis.suggestedType as ComponentConfig["type"];
  }

  if (analysis.layout) {
    config.layout = analysis.layout as ComponentConfig["layout"];
  }

  if (analysis.hasDarkBg) {
    config.darkMode = true;
  }

  if (analysis.hasGrid) {
    const colCount = analysis.width > 800 ? 4 : analysis.width > 500 ? 3 : 2;
    config.cols = colCount;
  }

  if (analysis.hasSidebar) {
    config.sidebar = "left";
    config.layout = "sidebar";
  }

  return config;
}
