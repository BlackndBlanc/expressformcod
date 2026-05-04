import compression from "compression";
import express from "express";
import morgan from "morgan";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequestHandler } from "@remix-run/express";

const currentDir = dirname(fileURLToPath(import.meta.url));
const app = express();
const port = Number(process.env.PORT || 3000);
const host = process.env.HOST || "0.0.0.0";
let remixHandler;
let prisma;

async function getRemixHandler() {
  if (!remixHandler) {
    const build = await import("./server/index.js");
    remixHandler = createRequestHandler({ build, mode: process.env.NODE_ENV });
  }

  return remixHandler;
}

async function getPrisma() {
  if (!prisma) {
    const { PrismaClient } = await import("@prisma/client");
    prisma = new PrismaClient();
  }

  return prisma;
}

app.disable("x-powered-by");
app.use(compression());
app.use(morgan("tiny"));

app.get("/health", (_request, response) => {
  response.status(200).send("ok");
});

app.get("/health/db", async (_request, response) => {
  try {
    const db = await getPrisma();
    const probe = await db.hostingerSupabaseProbe.create({
      data: {
        source: "hostinger-health",
        note: "Database write test from /health/db",
      },
    });
    const total = await db.hostingerSupabaseProbe.count();

    response.status(200).json({
      ok: true,
      database: "connected",
      insertedId: probe.id,
      total,
    });
  } catch (error) {
    console.error("Express Form COD database health check failed", error);
    response.status(500).json({
      ok: false,
      database: "failed",
      error: error instanceof Error ? error.message : "Unknown database error",
    });
  }
});

app.use(
  "/assets",
  express.static(join(currentDir, "client/assets"), {
    immutable: true,
    maxAge: "1y",
  })
);
app.use(express.static(join(currentDir, "client"), { maxAge: "1h" }));

app.all("*", async (request, response, next) => {
  try {
    const handler = await getRemixHandler();
    return handler(request, response, next);
  } catch (error) {
    console.error("Express Form COD failed to handle request", error);
    return next(error);
  }
});

app.listen(port, host, () => {
  console.log(`Express Form COD listening on ${host}:${port}`);
});
