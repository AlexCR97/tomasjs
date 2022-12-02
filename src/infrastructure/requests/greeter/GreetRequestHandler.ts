import { RequestContext, RequestHandler } from "@/requests";
import { PlainTextResponse } from "@/responses";
import { GreetRequest } from "./GreetRequest";

export class GreetRequestHandler extends RequestHandler<PlainTextResponse> {
  handle(context: RequestContext): PlainTextResponse {
    const request = context.getBody<GreetRequest>();
    return new PlainTextResponse(`Hello ${request.name}!`);
  }
}
