import { IProblemDetails, ProblemDetails } from "@/problems";
import { HttpContentType, IHttpContent } from "@tomasjs/core/http";

export class ProblemDetailsContent implements IHttpContent<IProblemDetails> {
  readonly type: HttpContentType = "application/problem+json";

  constructor(readonly data: Buffer) {}

  readData(): IProblemDetails {
    // TODO Add non-standard fields to extensions
    const json = this.data.toString();
    const problemDetails = JSON.parse(json);
    return ProblemDetails.from(problemDetails);
  }

  static from(problemDetails: ProblemDetails): ProblemDetailsContent {
    const plainProblemDetails = problemDetails.toPlain();
    const json = JSON.stringify(plainProblemDetails);
    const data = Buffer.from(json, "utf-8");
    return new ProblemDetailsContent(data);
  }
}
