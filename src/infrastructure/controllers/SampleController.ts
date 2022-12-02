import { Controller } from "@/controllers";
import { RequestContext } from "@/requests";
import { JsonResponse, PlainTextResponse } from "@/responses";
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
