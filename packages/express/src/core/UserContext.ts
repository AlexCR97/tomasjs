import { injectable } from "@tomasjs/core";

@injectable()
export class UserContext<TClaims = any> {
  claims?: TClaims;
}
