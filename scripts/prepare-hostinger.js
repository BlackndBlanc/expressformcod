import { copyFileSync, mkdirSync } from "node:fs";

mkdirSync("build", { recursive: true });
copyFileSync("server.hostinger.js", "build/server.js");
console.log("Prepared Hostinger entry file at build/server.js");
