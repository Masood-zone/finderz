import { spawn } from "node:child_process";
import { totalmem } from "node:os";
import { fileURLToPath } from "node:url";
import { buildExpoNodeArgs, chooseExpoHeapMb } from "./expo-memory.mjs";

const rawArgs = process.argv.slice(2);
const profileMemory = rawArgs.includes("--profile-memory");
const expoArgs = rawArgs.filter((argument) => argument !== "--profile-memory");

if (expoArgs.length === 0) {
  console.error("Usage: node scripts/run-expo.mjs [--profile-memory] <expo command> [...arguments]");
  process.exit(1);
}

let heapMb;
try {
  heapMb = chooseExpoHeapMb(totalmem(), process.env.EXPO_NODE_HEAP_MB);
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}

const expoCliPath = fileURLToPath(new URL("../node_modules/expo/bin/cli", import.meta.url));
const nodeArgs = buildExpoNodeArgs({ expoCliPath, expoArgs, heapMb, profileMemory });

console.log(
  `[finderz] Expo Node heap ceiling: ${heapMb} MB${profileMemory ? " (heap snapshots enabled)" : ""}`,
);

const child = spawn(process.execPath, nodeArgs, {
  cwd: process.cwd(),
  env: process.env,
  stdio: "inherit",
  windowsHide: true,
});

child.on("error", (error) => {
  console.error(`[finderz] Unable to start Expo: ${error.message}`);
  process.exitCode = 1;
});

child.on("exit", (code, signal) => {
  if (signal) {
    console.error(`[finderz] Expo stopped after signal ${signal}.`);
    process.exitCode = 1;
    return;
  }

  process.exitCode = code ?? 1;
});
