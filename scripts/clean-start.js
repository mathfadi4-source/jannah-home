const { execSync, spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const projectRoot = path.join(__dirname, "..");
const nextDir = path.join(projectRoot, ".next");

console.log("Cleaning .next cache...");
if (fs.existsSync(nextDir)) {
  fs.rmSync(nextDir, { recursive: true, force: true });
}

console.log("Starting dev server on http://localhost:3000");
console.log("If port 3000 is busy, close other terminals running npm run dev.\n");

const child = spawn("npx", ["next", "dev", "-p", "3000"], {
  cwd: projectRoot,
  stdio: "inherit",
  shell: true,
});

child.on("exit", (code) => process.exit(code ?? 0));
