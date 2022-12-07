import { HttpContext } from "@/core";
import { NextFunction, Request, Response } from "express";

export type ExpressMiddlewareHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => void | Promise<void>;

export type ThomasMiddlewareHandler = (
  context: HttpContext,
  next: NextFunction
) => void | Promise<void>;

// TODO Deprecate this and use ExpressMiddlewareHandler
export type MiddlewareHandler<T = any> = (
  req: Request,
  res: Response,
  next: NextFunction
) => T | Promise<T>;

export type ExpressErrorMiddlewareHandler<TError = any> = (
  err: TError,
  req: Request,
  res: Response,
  next: NextFunction
) => void | Promise<void>;

export type ThomasErrorMiddlewareHandler<TError = any> = (
  err: TError,
  context: HttpContext,
  next: NextFunction
) => void | Promise<void>;
