// Post-build shim.
// `nest build` (tsconfig.build.json rootDir "./src") emits the entry to
// dist/main.js, but the configured start command expects dist/src/main.js.
// Create a thin shim at dist/src/main.js that loads the real entry so either
// path works. Runs from the apps/api cwd (pnpm --filter @aps/api).
const fs = require("fs");
fs.mkdirSync("dist/src", { recursive: true });
fs.writeFileSync("dist/src/main.js", "require('../main.js');\n");
console.log("[postbuild-shim] wrote dist/src/main.js -> ../main.js");
