import { ProblemDetails } from "@/ProblemDetails";
import { Content } from "./Content";
import { ContentType } from "./ContentType";

export class ProblemDetailsContent extends Content<ProblemDetails> {
  override type: ContentType = "application/problem+json";

  readData(): ProblemDetails {
    // TODO Add non-standard fields to extensions
    const json = this.data.toString();
    const problemDetails = JSON.parse(json);
    return new ProblemDetails(problemDetails);
  }

  static from(problemDetails: ProblemDetails): ProblemDetailsContent {
    const plainProblemDetails = problemDetails.toPlain();
    const json = JSON.stringify(plainProblemDetails);
    const data = Buffer.from(json, "utf-8");
    return new ProblemDetailsContent(data);
  }
}
