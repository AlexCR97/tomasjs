import { HttpContext } from "@/core";

export interface Guard {
  // TODO Keep only 1 of the following

  canActivate(context: HttpContext): boolean | Promise<boolean>;

  canFulfill(context: HttpContext): boolean | Promise<boolean>;
  shouldFulfill(context: HttpContext): boolean | Promise<boolean>;

  isAllowed(context: HttpContext): boolean | Promise<boolean>;
  shouldAllow(context: HttpContext): boolean | Promise<boolean>;

  canProcess(context: HttpContext): boolean | Promise<boolean>;
  shouldProcess(context: HttpContext): boolean | Promise<boolean>;

  canContinue(context: HttpContext): boolean | Promise<boolean>;
  shouldContinue(context: HttpContext): boolean | Promise<boolean>;
}

// Middleware
// Guard
// Pipe
// ErrorHandler
