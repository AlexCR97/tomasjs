import { merge } from "@/system";
import { HttpContentType, IHttpContent, JsonRecord } from "./HttpContent";
import { IProblemDetails, ProblemDetails, ProblemDetailsBuilder } from "./ProblemDetails";

export class ProblemDetailsContent implements IHttpContent<IProblemDetails> {
  readonly type: HttpContentType = "application/problem+json";

  constructor(readonly data: Buffer) {}

  readData(): IProblemDetails {
    const builder = new ProblemDetailsBuilder();

    const json = this.data.toString();
    const plainProblemDetails = JSON.parse(json);
    builder.with(ProblemDetails.from(plainProblemDetails));

    const extensions = extractExtensions(plainProblemDetails);

    builder.withExtensions(extensions);

    return builder.build();

    function extractExtensions(plainProblemDetails: Record<string, unknown>) {
      const standardFields: (keyof IProblemDetails)[] = [
        "type",
        "status",
        "title",
        "details",
        "instance",
      ];

      const extensionFields = Object.keys(plainProblemDetails).filter(
        (key) => !standardFields.includes(key as keyof IProblemDetails)
      );

      const extensions: Record<string, unknown>[] = extensionFields.map((key) => ({
        [key]: plainProblemDetails[key],
      }));

      return merge(extensions);
    }
  }

  readJson<TJson extends JsonRecord>(): TJson {
    const json = this.data.toString();
    return JSON.parse(json);
  }

  readText(): string {
    const json = this.readJson();
    return JSON.stringify(json, undefined, 2);
  }

  toString(): string {
    return this.readText();
  }

  static from(problems: IProblemDetails): ProblemDetailsContent {
    const problemDetails = ProblemDetails.from(problems);
    const plainProblemDetails = problemDetails.toPlain();
    const json = JSON.stringify(plainProblemDetails);
    const data = Buffer.from(json, "utf-8");
    return new ProblemDetailsContent(data);
  }
}
