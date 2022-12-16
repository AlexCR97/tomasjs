import { HttpContext, StatusCodes, UserContext } from "@/core";
import { Middleware } from "@/middleware";
import { StatusCodeResponse } from "@/responses";
import { NextFunction } from "express";
import { JwtVerifier } from "./JwtVerifier";
import { JwtVerifyOptions } from "./JwtVerifyOptions";

export class JwtMiddleware extends Middleware {
  constructor(private readonly options: JwtVerifyOptions) {
    super();
  }

  async handle(context: HttpContext, next: NextFunction): Promise<void> {
    const authHeader = context.request.headers.authorization;

    if (!authHeader) {
      return context.respond(new StatusCodeResponse(StatusCodes.unauthorized));
    }

    const accessToken = authHeader.split(" ")[1]; // "Bearer <accessToken>"

    if (accessToken === undefined || accessToken === null || accessToken.trim().length === 0) {
      return context.respond(new StatusCodeResponse(StatusCodes.unauthorized));
    }

    try {
      const user = await JwtVerifier.verifyAsync(accessToken, this.options);
      context.user = new UserContext();
      context.user.claims = user;
      return next();
    } catch (err) {
      context.user = undefined;
      return context.respond(new StatusCodeResponse(StatusCodes.unauthorized));
    }
  }
}
