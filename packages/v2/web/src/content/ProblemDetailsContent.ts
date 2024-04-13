import { ProblemDetails } from "@/ProblemDetails";
import { Content } from "./Content";
import { ContentType } from "./ContentType";

export class ProblemDetailsContent extends Content<ProblemDetails> {
  override type: ContentType = "application/problem+json";

  readData(): ProblemDetails {
    const json = this.data.toString();
    const problemDetails = JSON.parse(json);
    return new ProblemDetails(problemDetails);
  }

  static from(problemDetails: ProblemDetails): ProblemDetailsContent {
    const json = JSON.stringify(problemDetails);
    const data = Buffer.from(json, "utf-8");
    return new ProblemDetailsContent(data);
  }
}
