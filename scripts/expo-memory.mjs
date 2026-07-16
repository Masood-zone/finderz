const MEBIBYTE = 1024 * 1024;

export const MIN_HEAP_MB = 1024;
export const MAX_HEAP_MB = 16_384;
export const MIN_WORKERS = 1;
export const MAX_WORKERS = 16;

function parseOverride(value, name, minimum, maximum) {
  if (value === undefined || value === "") return null;

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < minimum || parsed > maximum) {
    throw new Error(`${name} must be a whole number from ${minimum} through ${maximum}.`);
  }

  return parsed;
}

export function chooseExpoHeapMb(totalMemoryBytes, override) {
  const configured = parseOverride(override, "EXPO_NODE_HEAP_MB", MIN_HEAP_MB, MAX_HEAP_MB);
  if (configured !== null) return configured;

  const totalMemoryMb = Math.floor(totalMemoryBytes / MEBIBYTE);
  if (totalMemoryMb >= 24 * 1024) return 8192;
  if (totalMemoryMb >= 16 * 1024) return 6144;
  if (totalMemoryMb >= 12 * 1024) return 4096;
  if (totalMemoryMb >= 8 * 1024) return 3072;
  return 2048;
}

export function chooseExpoMaxWorkers(totalMemoryBytes, override) {
  const configured = parseOverride(override, "EXPO_MAX_WORKERS", MIN_WORKERS, MAX_WORKERS);
  if (configured !== null) return configured;

  const totalMemoryMb = Math.floor(totalMemoryBytes / MEBIBYTE);
  if (totalMemoryMb < 8 * 1024) return 1;
  if (totalMemoryMb < 16 * 1024) return 2;
  return 4;
}

export function addDefaultMaxWorkers(expoArgs, maxWorkers) {
  const command = expoArgs[0];
  const supportsWorkers = command === "start" || command === "export";
  const hasWorkers = expoArgs.some(
    (argument) => argument === "--max-workers" || argument.startsWith("--max-workers="),
  );

  return supportsWorkers && !hasWorkers
    ? [...expoArgs, "--max-workers", String(maxWorkers)]
    : expoArgs;
}

export function buildExpoNodeArgs({ expoCliPath, expoArgs, heapMb, profileMemory }) {
  return [
    `--max-old-space-size=${heapMb}`,
    ...(profileMemory ? ["--heapsnapshot-near-heap-limit=2"] : []),
    expoCliPath,
    ...expoArgs,
  ];
}
