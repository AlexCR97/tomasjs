import { Request, Response, NextFunction } from "express";
import { verify } from "jsonwebtoken";
import { Middleware } from "../../../src/middleware";
import { AuthOptions } from "../handlers/AuthOptions";

// TODO Standardize middleware

export class JwtMiddleware extends Middleware {
  handle(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({
        message: "Authorization header was not found",
        statusCode: 401,
      });
      return;
    }

    const accessToken = authHeader.split(" ")[1]; // "Bearer <accessToken>"

    if (!accessToken) {
      res.status(401).json({
        message: "Could not find access token in authorization header",
        statusCode: 401,
      });
      return;
    }

    verify(accessToken, AuthOptions.secret, (err, user) => {
      if (err) {
        res.status(403).json({
          message: "Invalid token",
          statusCode: 403,
        });
        return;
      }

      (req as any).user = user;

      next();
    });
  }
}
