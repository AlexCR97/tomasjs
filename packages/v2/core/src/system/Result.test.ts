import { Result, ResultFailure, ResultSuccess } from "./Result";

describe("Result", () => {
  it("should create a failure result", () => {
    const error = new Error("This is an error");
    const result = Result.failure(error);
    expect(result).toBeInstanceOf(Result);
    expect(result.error).toBe(error);
    expect(result.data).toBeNull();
  });

  it("should create a success result without data", () => {
    const result = Result.success();
    expect(result).toBeInstanceOf(Result);
    expect(result.error).toBeNull();
    expect(result.data).toBeNull();
  });

  it("should create a success result with data", () => {
    interface MyData {
      message: string;
    }

    const data: MyData = { message: "Some data" };
    const result = Result.success(data);
    expect(result).toBeInstanceOf(Result);
    expect(result.error).toBeNull();
    expect(result.data).toBe(data);
  });

  it("should use a failure result to control code flow", (done) => {
    function getFailedResult(): ResultFailure<Error> {
      return Result.failure(new Error("The operation failed"));
    }

    const { error } = getFailedResult();

    if (error) {
      return done();
    }

    return done("This line should not be executed");
  });

  it("should use a success result to control code flow", (done) => {
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
