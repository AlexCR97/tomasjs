import { RequestContext, RequestHandler } from "@/core/requests/core";
import { PlainTextResponse } from "@/core/requests/core/responses";
import { injectable } from "tsyringe";

@injectable()
export class HealthCheckRequestHandler extends RequestHandler<PlainTextResponse> {
  handle(context: RequestContext): PlainTextResponse {
    return new PlainTextResponse("Healthy");
  }
}
