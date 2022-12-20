import { container, singleton } from "tsyringe";
import { HttpContext } from "./HttpContext";

@singleton()
export class HttpContextAccessor {
  get httpContext(): HttpContext {
    console.log("getting HttpContext...");
    return container.resolve(HttpContext);
  }

  getHttpContext(): HttpContext {
    return container.resolve(HttpContext);
  }
}
