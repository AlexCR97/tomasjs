import { RequestContext, RequestHandler } from "@/requests";
import { PlainTextResponse } from "@/responses";
import { injectable } from "tsyringe";

@injectable()
export class HealthCheckRequestHandler extends RequestHandler<PlainTextResponse> {
  handle(context: RequestContext): PlainTextResponse {
    return new PlainTextResponse("Healthy");
  }
}
