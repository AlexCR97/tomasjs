import { singleton } from "@tomasjs/core";

@singleton()
export class UserContext<TClaims = any> {
  claims?: TClaims;
}
