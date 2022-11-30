import { RequestContext, RequestHandler } from "@/core/httpx/core/requests";
import { PlainTextResponse } from "@/core/httpx/core/responses";
import { injectable } from "tsyringe";

@injectable()
export class HealthCheckRequestHandler extends RequestHandler<PlainTextResponse> {
  handle(context: RequestContext): PlainTextResponse {
    return new PlainTextResponse("Healthy");
  }
}
