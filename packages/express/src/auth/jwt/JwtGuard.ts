import { Guard, GuardContext } from "@/guards";
import { JwtVerifier } from "./JwtVerifier";
import { JwtVerifyOptions } from "./JwtVerifyOptions";

export class JwtGuard implements Guard {
  constructor(private readonly options: JwtVerifyOptions) {}

  async isAllowed({ request, response }: GuardContext): Promise<boolean> {
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      return false;
    }

    const accessToken = authHeader.split(" ")[1]; // "Bearer <accessToken>"

    if (accessToken === undefined || accessToken === null || accessToken.trim().length === 0) {
      return false;
    }

    const { error } = await JwtVerifier.tryVerifyAsync(accessToken, this.options);

    return error ? false : true;
  }
}
