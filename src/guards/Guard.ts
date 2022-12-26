import { HttpContext } from "@/core";

export interface Guard {
  isAllowed(context: HttpContext): boolean | Promise<boolean>;
}

// TODO Add these comments to a readme
// Middleware
// Guard
// Pipe
// ErrorHandler
