import { RequestContext, RequestHandler } from "@/core/httpx/requests";
import { PlainTextResponse } from "@/core/httpx/responses";
import { GreetRequest } from "./GreetRequest";

export class GreetRequestHandler extends RequestHandler<PlainTextResponse> {
  handle(context: RequestContext): PlainTextResponse {
    const request = context.getBody<GreetRequest>();
    return new PlainTextResponse(`Hello ${request.name}!`);
  }
}
