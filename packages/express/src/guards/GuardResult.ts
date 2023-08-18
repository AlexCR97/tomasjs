import { ForbiddenResponse, UnauthorizedResponse } from "@/responses/status-codes";

export type GuardResult =
  | boolean
  | UnauthorizedResponse
  | ForbiddenResponse
  | Promise<boolean>
  | Promise<UnauthorizedResponse>
  | Promise<ForbiddenResponse>;
