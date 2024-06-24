import { Result, ResultFailure, ResultSuccess } from "@tomasjs/core/system";
import { exec } from "node:child_process";

export type ExecutableOptions = {
  onStdOut: (data: any) => void;
  onStdErr: (data: any) => void;
};

export class Executable {
  // See https://stackoverflow.com/a/41407246/11435765
  private readonly colorReset = "\x1b[0m";
  private readonly colorYellow = "\x1b[33m";
  private readonly colorGray = "\x1b[90m";
  private readonly colorRed = "\x1b[41m";

  private readonly options: ExecutableOptions;

  constructor(private readonly command: string, options?: Partial<ExecutableOptions>) {
    this.options = {
      onStdOut:
        options?.onStdOut ??
        ((data) => process.stdout.write(`${this.colorGray}${data}${this.colorReset}`)),
      onStdErr:
        options?.onStdErr ??
        ((data) => process.stderr.write(`${this.colorRed}${data}${this.colorReset}`)),
    };
  }

  async run(): Promise<ResultFailure<Error> | ResultSuccess<number | null>> {
    return new Promise((resolve) => {
      process.stdout.write(`${this.colorYellow}> ${this.command}${this.colorReset}\n`);

      const child = exec(this.command);

      child.stdout?.on("data", (data) => {
        this.options.onStdOut(data);
      });

      child.stderr?.on("data", (data) => {
        this.options.onStdErr(data);
      });

      child.on("close", (code) => {
        return resolve(Result.success(code));
      });

      child.on("error", (err) => {
        return resolve(Result.failure(err));
      });
    });
  }

  static async run(
    command: string,
    options?: Partial<ExecutableOptions>
  ): Promise<ResultFailure<Error> | ResultSuccess<number | null>> {
    return await new Executable(command, options).run();
  }
}
