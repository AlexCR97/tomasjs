import { Request } from "express";
import { HttpUser } from "./HttpUser";

// TODO Convert to class
export type HttpRequest = Request & {
  user: HttpUser;
};
