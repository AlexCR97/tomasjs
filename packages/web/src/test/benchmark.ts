export type BenchmarkOptions = {
  iterations?: number;
  functions: BenchmarkFunction[];
};

export type BenchmarkFunction = {
  name: string;
  func: () => void | Promise<void>;
};

export type BenchmarkResult = {
  [key: string]: {
    averageMs: number;
    totalMs: number;
  };
};

export async function benchmark(options: BenchmarkOptions): Promise<BenchmarkResult> {
  const functions = options.functions;
  const iterations = options.iterations ?? 100;
  const results: BenchmarkResult = {};

  for (const { name, func } of functions) {
    const start = performance.now();

    for (let i = 0; i < iterations; i++) {
      await func();
    }

    const end = performance.now();
    const totalMs = end - start;
    const averageMs = totalMs / iterations;

    results[name] = { averageMs, totalMs };
  }

  return results;
}
