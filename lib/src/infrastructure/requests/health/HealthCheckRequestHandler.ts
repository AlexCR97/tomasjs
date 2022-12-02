import { RequestContext, RequestHandler } from "@/@thomas/requests";
import { PlainTextResponse } from "@/@thomas/responses";
import { injectable } from "tsyringe";

@injectable()
export class HealthCheckRequestHandler extends RequestHandler<PlainTextResponse> {
  handle(context: RequestContext): PlainTextResponse {
    return new PlainTextResponse("Healthy");
  }
}
