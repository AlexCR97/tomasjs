import { Result, ResultFailure, ResultSuccess } from "@tomasjs/core/system";
import { exec } from "node:child_process";

export class Executable {
  // See https://stackoverflow.com/a/41407246/11435765
  private readonly colorReset = "\x1b[0m";
  private readonly colorYellow = "\x1b[33m";
  private readonly colorGray = "\x1b[90m";
  private readonly colorRed = "\x1b[41m";

  constructor(private readonly command: string) {}

  async run(): Promise<ResultFailure<Error> | ResultSuccess<number | null>> {
    return new Promise((resolve) => {
      process.stdout.write(`${this.colorYellow}> ${this.command}${this.colorReset}\n`);

      const child = exec(this.command);

      child.stdout?.on("data", (data) => {
        process.stdout.write(`${this.colorGray}${data}${this.colorReset}`);
      });

      child.stderr?.on("data", (data) => {
        process.stdout.write(`${this.colorRed}${data}${this.colorReset}`);
      });

      child.on("close", (code) => {
        return resolve(Result.success(code));
      });

      child.on("error", (err) => {
        return resolve(Result.failure(err));
      });
    });
  }

  static async run(command: string): Promise<ResultFailure<Error> | ResultSuccess<number | null>> {
    return await new Executable(command).run();
  }
}
