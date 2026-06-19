import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import cors from "cors";
import { config } from "./config.js";
import generateRouter from "./routes/generate.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

app.use(cors());
app.use(express.json({ limit: `${config.maxImageSizeMb + 5}mb` }));

// Static web UI
app.use(express.static(path.join(__dirname, "..", "public")));

// API routes
app.use("/api", generateRouter);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Fallback to web UI
app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

app.listen(config.port, () => {
  console.log(`[component-agent] Running on http://localhost:${config.port}`);
  console.log(`[component-agent] POST /api/generate  -  GET /api/types  -  GET /health`);
  console.log(`[component-agent] Web UI at http://localhost:${config.port}`);
});
