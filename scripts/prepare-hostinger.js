import { copyFileSync, mkdirSync, writeFileSync } from "node:fs";

mkdirSync("build", { recursive: true });
copyFileSync("server.hostinger.js", "build/server.js");
writeFileSync(
  "build/package.json",
  JSON.stringify(
    {
      type: "module",
    },
    null,
    2
  )
);
console.log("Prepared Hostinger entry file at build/server.js");
