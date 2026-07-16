import assert from "node:assert/strict";
import test from "node:test";
import {
  addDefaultMaxWorkers,
  buildExpoNodeArgs,
  chooseExpoHeapMb,
  chooseExpoMaxWorkers,
} from "../scripts/expo-memory.mjs";

const gibibytes = (value) => value * 1024 * 1024 * 1024;

test("chooses a bounded heap allowance for common laptop memory sizes", () => {
  assert.equal(chooseExpoHeapMb(gibibytes(4)), 2048);
  assert.equal(chooseExpoHeapMb(gibibytes(8)), 3072);
  assert.equal(chooseExpoHeapMb(gibibytes(12)), 4096);
  assert.equal(chooseExpoHeapMb(gibibytes(16)), 6144);
  assert.equal(chooseExpoHeapMb(gibibytes(24)), 8192);
  assert.equal(chooseExpoHeapMb(gibibytes(64)), 8192);
});

test("accepts a safe explicit heap override", () => {
  assert.equal(chooseExpoHeapMb(gibibytes(8), "5120"), 5120);
});

test("limits Metro concurrency on lower-memory laptops", () => {
  assert.equal(chooseExpoMaxWorkers(gibibytes(4)), 1);
  assert.equal(chooseExpoMaxWorkers(gibibytes(8)), 2);
  assert.equal(chooseExpoMaxWorkers(gibibytes(16)), 4);
  assert.equal(chooseExpoMaxWorkers(gibibytes(64)), 4);
  assert.equal(chooseExpoMaxWorkers(gibibytes(8), "3"), 3);
});

test("rejects invalid heap overrides", () => {
  assert.throws(() => chooseExpoHeapMb(gibibytes(8), "512"), /whole number/);
  assert.throws(() => chooseExpoHeapMb(gibibytes(8), "a lot"), /whole number/);
});

test("adds a worker limit only when Expo supports it and preserves an explicit limit", () => {
  assert.deepEqual(addDefaultMaxWorkers(["start"], 2), ["start", "--max-workers", "2"]);
  assert.deepEqual(addDefaultMaxWorkers(["export", "--max-workers", "1"], 2), [
    "export",
    "--max-workers",
    "1",
  ]);
  assert.deepEqual(addDefaultMaxWorkers(["lint"], 2), ["lint"]);
});

test("enables snapshots only for the profiling command", () => {
  const normal = buildExpoNodeArgs({
    expoCliPath: "expo-cli",
    expoArgs: ["start"],
    heapMb: 4096,
    profileMemory: false,
  });
  const profiled = buildExpoNodeArgs({
    expoCliPath: "expo-cli",
    expoArgs: ["start"],
    heapMb: 4096,
    profileMemory: true,
  });

  assert.deepEqual(normal, ["--max-old-space-size=4096", "expo-cli", "start"]);
  assert.deepEqual(profiled, [
    "--max-old-space-size=4096",
    "--heapsnapshot-near-heap-limit=2",
    "expo-cli",
    "start",
  ]);
});
