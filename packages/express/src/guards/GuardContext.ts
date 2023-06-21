import { UserContext } from "@/core";
import { Request, Response } from "express";

export class GuardContext {
  readonly req!: Request;
  readonly res!: Response;
  readonly user?: UserContext;
}
