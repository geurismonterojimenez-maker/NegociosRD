import fs from "fs";
import path from "path";

const target = path.join(process.cwd(), "dist", "server.cjs");

if (fs.existsSync(target)) {
  // Dynamic import of the compiled CommonJS server bundle
  await import("./dist/server.cjs");
} else {
  console.log("[Hostinger Wrapper] Production bundle not found yet. This is normal during the initialization/build phase.");
}

