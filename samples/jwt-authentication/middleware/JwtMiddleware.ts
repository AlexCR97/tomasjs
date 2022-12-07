import { NextFunction } from "express";
import { JwtPayload, verify } from "jsonwebtoken";
import { HttpContext, StatusCodes, UserContext } from "../../../src/core";
import { ThomasMiddleware } from "../../../src/middleware";
import { JsonResponse } from "../../../src/responses";
import { AuthOptions } from "../handlers/AuthOptions";

export class JwtMiddleware extends ThomasMiddleware {
  async handle(context: HttpContext, next: NextFunction): Promise<void> {
    const authHeader = context.request.headers.authorization;

    if (!authHeader) {
      // context.response.status(401).json({
      //   statusCode: 401,
      // });
      context.respond(
        new JsonResponse(
          { message: "Authorization header was not found" },
          { status: StatusCodes.unauthorized }
        )
      );
      return;
    }

    const accessToken = authHeader.split(" ")[1]; // "Bearer <accessToken>"

    if (!accessToken) {
      // context.response.status(401).json({
      //   message: "Could not find access token in authorization header",
      //   statusCode: 401,
      // });
      context.respond(
        new JsonResponse(
          { message: "Could not find access token in authorization header" },
          { status: StatusCodes.unauthorized }
        )
      );
      return;
    }

    try {
      const user = await this.verifyTokenAsync(accessToken, AuthOptions.secret);
      context.user = new UserContext();
      context.user.claims = user;
      next();
    } catch (err) {
      // context.response.status(403).json({
      //   message: "Invalid token",
      //   statusCode: 403,
      // });
      context.respond(
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
