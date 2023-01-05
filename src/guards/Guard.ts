import { GuardContext } from "./GuardContext";
import { GuardResult } from "./GuardResult";

export interface Guard {
  isAllowed(context: GuardContext): GuardResult;
}

// TODO Add these comments to a readme
// Middleware
// Guard
// Pipe
// ErrorHandler
