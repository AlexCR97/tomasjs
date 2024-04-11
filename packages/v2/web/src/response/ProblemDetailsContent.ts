import { ProblemDetails } from "@/ProblemDetails";
import { ResponseContent } from "./EndpointResponse";

type ProblemDetailsOptions = ConstructorParameters<typeof ProblemDetails>[0];

export class ProblemDetailsContent extends ResponseContent<ProblemDetails> {
  override contentType: string = "application/problem+json";

  constructor(options: ProblemDetailsOptions) {
    const problemDetails = new ProblemDetails(options);
    super(problemDetails);
  }

  override readContent(): string | Buffer | Uint8Array {
    return JSON.stringify(this.data);
  }
}
