import { GuardContext } from "./GuardContext";

export interface Guard {
  isAllowed(context: GuardContext): boolean | Promise<boolean>;
}

// TODO Add these comments to a readme
// Middleware
// Guard
// Pipe
// ErrorHandler
