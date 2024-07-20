import { Result, ResultFailure, ResultSuccess } from "@tomasjs/core/system";
import { escape } from "@tomasjs/core/system/console";
import { exec } from "node:child_process";

export type ExecutableOptions = {
  onStdOut: (data: any) => void;
  onStdErr: (data: any) => void;
};

export class Executable {
  private readonly options: ExecutableOptions;

  constructor(private readonly command: string, options?: Partial<ExecutableOptions>) {
    this.options = {
      onStdOut: options?.onStdOut ?? ((data) => process.stdout.write(escape("black", data))),
      onStdErr: options?.onStdErr ?? ((data) => process.stderr.write(escape("red", data))),
    };
  }

  async run(): Promise<ResultFailure<Error> | ResultSuccess<number | null>> {
    return new Promise((resolve) => {
      process.stdout.write(escape("yellow", `> ${this.command}\n`));

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
