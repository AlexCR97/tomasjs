import { Controller } from "@/@thomas/controllers";
import { RequestContext } from "@/@thomas/requests";
import { JsonResponse, PlainTextResponse } from "@/@thomas/responses";
import { injectable } from "tsyringe";

@injectable()
export class SampleController extends Controller {
  route = "sample";

  constructor() {
    super();

    this.get("/", (context: RequestContext) => {
      return new PlainTextResponse("Hello, ThomasJS!");
    });

    this.post("/", (context: RequestContext) => {
      const username = context.body.name;
      return new JsonResponse({ message: `Hello, ${username}!` });
    });
  }
}
