import { ErrorOptions, TomasError } from "@/errors";
import { HttpResponse } from "./HttpResponse";

export class JsonSerializationError extends TomasError {
  private constructor(message: string, options?: ErrorOptions) {
    super("core/http/JsonSerialization", message, options);
  }

  static cannotDeserialize(response: HttpResponse): JsonSerializationError {
    return new JsonSerializationError(
      "Cannot deserialize json response of failed request. See error's data for more information.",
      {
        data: { response },
      }
    );
  }
}
