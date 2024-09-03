import { ProblemDetails } from "./ProblemDetails";
import { ProblemDetailsContent } from "./ProblemDetailsContent";
import { HTTP_STATUS_CODES } from "@tomasjs/core/http";

describe("problems/ProblemDetailsContent", () => {
  const problems = ProblemDetails.from({
    type: "http://localhost:80/test",
    status: HTTP_STATUS_CODES.badRequest,
    title: "test",
    details: "this is a test",
    instance: "/",
    extensions: {
      foo: "bar",
      fizz: "buzz",
    },
  });

  it("should read data", () => {
    const content = ProblemDetailsContent.from(problems);
    const contentData = content.readData();
    expect(contentData.type).toMatch(problems.type);
    expect(contentData.status).toBe(problems.status);
    expect(contentData.title).toMatch(problems.title);
    expect(contentData.details).toMatch(problems.details!);
    expect(contentData.instance).toMatch(problems.instance);
    expect(contentData.extensions).toMatchObject(problems.extensions!);
  });
});
