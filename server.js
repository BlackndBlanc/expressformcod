import compression from "compression";
import express from "express";
import morgan from "morgan";
import { createRequestHandler } from "@remix-run/express";

const app = express();
const port = Number(process.env.PORT || 3000);
const host = process.env.HOST || "0.0.0.0";
const build = await import("./build/index.js");

app.disable("x-powered-by");
app.use(compression());
app.use(morgan("tiny"));
app.get("/health", (_request, response) => {
  response.status(200).send("ok");
});

app.use(
  "/build",
  express.static("public/build", { immutable: true, maxAge: "1y" })
);
app.use(express.static("public", { maxAge: "1h" }));
app.all("*", createRequestHandler({ build, mode: process.env.NODE_ENV }));

app.listen(port, host, () => {
  console.log(`Express Form COD listening on ${host}:${port}`);
});
