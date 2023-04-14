import { UserContext } from "@/core";
import { request, response } from "express";

export class GuardContext {
  readonly request!: typeof request;
  readonly response!: typeof response;
  readonly user?: UserContext;
}
