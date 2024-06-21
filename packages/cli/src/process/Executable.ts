import { Result, ResultFailure, ResultSuccess } from "@tomasjs/core/system";
import { exec } from "node:child_process";

export class Executable {
  constructor(private readonly command: string) {}

  async run(): Promise<ResultFailure<Error> | ResultSuccess<number | null>> {
    return new Promise((resolve) => {
      const child = exec(this.command);

      child.stdout?.on("data", (data) => {
        console.log(data);
      });

      child.stderr?.on("data", (data) => {
        console.error(data);
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
