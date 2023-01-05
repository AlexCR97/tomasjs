import { internalContainer } from "@/container";
import { UserContext } from "@/core";
import { guard, Guard, GuardContext } from "@/guards";
import { JwtVerifier } from "./JwtVerifier";
import { JwtVerifyOptions } from "./JwtVerifyOptions";

@guard()
export class JwtGuard implements Guard {
  constructor(private readonly options: JwtVerifyOptions) {}

  async isAllowed(context: GuardContext): Promise<boolean> {
    const authHeader = context.request.headers.authorization;

    if (!authHeader) {
      return false;
    }

    const accessToken = authHeader.split(" ")[1]; // "Bearer <accessToken>"

    if (accessToken === undefined || accessToken === null || accessToken.trim().length === 0) {
      return false;
    }

    const { error, result: user } = await JwtVerifier.tryVerifyAsync(accessToken, this.options);

    if (error) {
      return false;
    }

    const userContext = internalContainer.get(UserContext);
    userContext.claims = user;

    return true;
  }
}
