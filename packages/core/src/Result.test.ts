import "reflect-metadata";
import { it, describe, expect } from "@jest/globals";
import { Result, ResultFailure, ResultSuccess } from "./Result";

describe("Result", () => {
  it("Can create a failed result", () => {
    const error = new Error("This is an error");
    const result = Result.failure(error);
    expect(result).toBeInstanceOf(Result);
    expect(result.error).toBe(error);
    expect(result.data).toBeNull();
  });

  it("Can create a successful result without data", () => {
    const result = Result.success();
    expect(result).toBeInstanceOf(Result);
    expect(result.error).toBeNull();
    expect(result.data).toBeNull();
  });

  it("Can create a successful result with data", () => {
    interface MyData {
      message: string;
    }

    const data: MyData = { message: "Some data" };
    const result = Result.success(data);
    expect(result).toBeInstanceOf(Result);
    expect(result.error).toBeNull();
    expect(result.data).toBe(data);
  });

  it("Can use a failed to result to control code flow", (done) => {
    function getFailedResult(): ResultFailure<Error> {
      return Result.failure(new Error("The operation failed"));
    }

    const { error } = getFailedResult();

    if (error) {
      return done();
    }

    return done("This line should not be executed");
  });

  it("Can use a successful result to control code flow", (done) => {
    function getSuccessfulResult(): ResultSuccess {
      return Result.success();
    }

    const { error } = getSuccessfulResult();

    if (error) {
      return done("This line should not be executed");
    }

    return done();
  });
});
