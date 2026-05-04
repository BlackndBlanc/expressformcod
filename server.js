import compression from "compression";
import express from "express";
import morgan from "morgan";
import { createRequestHandler } from "@remix-run/express";

const app = express();
const port = Number(process.env.PORT || 3000);
const host = process.env.HOST || "0.0.0.0";
let remixHandler;

async function getRemixHandler() {
  if (!remixHandler) {
    const build = await import("./build/server/index.js");
    remixHandler = createRequestHandler({ build, mode: process.env.NODE_ENV });
  }

  return remixHandler;
}

app.disable("x-powered-by");
app.use(compression());
app.use(morgan("tiny"));

app.get("/health", (_request, response) => {
  response.status(200).send("ok");
});

app.use(
  "/assets",
  express.static("build/client/assets", { immutable: true, maxAge: "1y" })
);
app.use(express.static("build/client", { maxAge: "1h" }));

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
