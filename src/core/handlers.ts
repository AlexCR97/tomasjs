import { Request, Response } from "express";
import { HttpContext } from "./HttpContext";

export type ExpressRequestHandler = (req: Request, res: Response) => void | Promise<void>;

export type RequestHandler<TResponse = void> = (
  context: HttpContext
) => TResponse | Promise<TResponse>;
