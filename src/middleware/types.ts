import { HttpContext } from "@/core";
import { NextFunction, Request, Response } from "express";

export type ExpressMiddlewareHandler<TResult = any> = (
  req: Request,
  res: Response,
  next: NextFunction
) => TResult | Promise<TResult>;

export type ThomasMiddlewareHandler<TResult = any> = (
  context: HttpContext,
  next: NextFunction
) => TResult | Promise<TResult>;

// TODO Deprecate this and use ExpressMiddlewareHandler
export type MiddlewareHandler<T = any> = (
  req: Request,
  res: Response,
  next: NextFunction
) => T | Promise<T>;

export type ExpressErrorMiddlewareHandler<TError = any, TResult = any> = (
  err: TError,
  req: Request,
  res: Response,
  next: NextFunction
) => TResult | Promise<TResult>;

export type ThomasErrorMiddlewareHandler<TError = any, TResult = any> = (
  err: TError,
  context: HttpContext,
  next: NextFunction
) => TResult | Promise<TResult>;
