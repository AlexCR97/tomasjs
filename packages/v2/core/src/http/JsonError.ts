import { ErrorOptions, TomasError } from "@/errors";
import { HttpResponse } from "./HttpResponse";

export class JsonError extends TomasError {
  private constructor(message: string, options?: ErrorOptions) {
    super("JSON_ERROR", message, options);
  }

  static cannotDeserialize(response: HttpResponse): JsonError {
    return new JsonError(
      "Cannot deserialize json response of failed request. See error's data for more information.",
      {
        data: { response },
      }
    );
  }
}
