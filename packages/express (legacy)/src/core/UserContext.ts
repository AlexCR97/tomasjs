import { singleton } from "@/container";

@singleton()
export class UserContext<TClaims = any> {
  claims?: TClaims;
}
