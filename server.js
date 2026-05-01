import compression from "compression";
import express from "express";
import morgan from "morgan";
import { createRequestHandler } from "@remix-run/express";

const app = express();
const port = Number(process.env.PORT || 3000);
const build = await import("./build/server/index.js");

app.disable("x-powered-by");
app.use(compression());
app.use(morgan("tiny"));

app.use(
  "/assets",
  express.static("build/client/assets", { immutable: true, maxAge: "1y" })
);
app.use(express.static("build/client", { maxAge: "1h" }));
app.all("*", createRequestHandler({ build, mode: process.env.NODE_ENV }));

app.listen(port, () => {
  console.log(`Express Form COD listening on port ${port}`);
});
