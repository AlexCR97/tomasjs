import { NextFunction } from "express";
import { JwtPayload, verify } from "jsonwebtoken";
import { HttpContext, StatusCodes, UserContext } from "../../../src/core";
import { ThomasMiddleware } from "../../../src/middleware";
import { JsonResponse } from "../../../src/responses";
import { environment } from "../environment";

export class JwtMiddleware extends ThomasMiddleware {
  async handle(context: HttpContext, next: NextFunction): Promise<void> {
    const authHeader = context.request.headers.authorization;

    if (!authHeader) {
      return context.respond(
        new JsonResponse(
          { message: "Authorization header was not found" },
          { status: StatusCodes.unauthorized }
        )
      );
    }

    const accessToken = authHeader.split(" ")[1]; // "Bearer <accessToken>"

    if (!accessToken) {
      return context.respond(
        new JsonResponse(
          { message: "Could not find access token in authorization header" },
          { status: StatusCodes.unauthorized }
        )
      );
    }

    try {
      const user = await this.verifyTokenAsync(accessToken, environment.auth.secret);
      context.user = new UserContext();
      context.user.claims = user;
      return next();
    } catch (err) {
      context.user = undefined;
      return context.respond(
        new JsonResponse({ message: "Invalid token" }, { status: StatusCodes.forbidden })
      );
    }
  }

  private verifyTokenAsync(
    token: string,
    secret: string
  ): Promise<string | JwtPayload | undefined> {
    return new Promise<string | JwtPayload | undefined>((resolve, reject) => {
      verify(token, secret, (err, user) => {
        if (err) {
          reject(err);
        } else {
          resolve(user);
        }
      });
    });
  }
}
