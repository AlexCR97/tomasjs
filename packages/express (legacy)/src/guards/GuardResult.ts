import { ForbiddenResponse, UnauthorizedResponse } from "@/responses/status-codes";

// TODO Figure out a neat way to override the Guard's 401 response
export type GuardResult =
  | boolean
  | UnauthorizedResponse
  | ForbiddenResponse
  | Promise<boolean>
  | Promise<UnauthorizedResponse>
  | Promise<ForbiddenResponse>;
