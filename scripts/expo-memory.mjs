const MEBIBYTE = 1024 * 1024;

export const MIN_HEAP_MB = 1024;
export const MAX_HEAP_MB = 16_384;

function parseOverride(value) {
  if (value === undefined || value === "") return null;

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < MIN_HEAP_MB || parsed > MAX_HEAP_MB) {
    throw new Error(
      `EXPO_NODE_HEAP_MB must be a whole number from ${MIN_HEAP_MB} through ${MAX_HEAP_MB}.`,
    );
  }

  return parsed;
}

export function chooseExpoHeapMb(totalMemoryBytes, override) {
  const configured = parseOverride(override);
  if (configured !== null) return configured;

  const totalMemoryMb = Math.floor(totalMemoryBytes / MEBIBYTE);
  if (totalMemoryMb >= 24 * 1024) return 8192;
  if (totalMemoryMb >= 16 * 1024) return 6144;
  if (totalMemoryMb >= 12 * 1024) return 4096;
  if (totalMemoryMb >= 8 * 1024) return 3072;
  return 2048;
}

export function buildExpoNodeArgs({ expoCliPath, expoArgs, heapMb, profileMemory }) {
  return [
    `--max-old-space-size=${heapMb}`,
    ...(profileMemory ? ["--heapsnapshot-near-heap-limit=2"] : []),
    expoCliPath,
    ...expoArgs,
  ];
}
