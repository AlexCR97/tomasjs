import { HttpUser } from "@/core";

declare global {
  namespace Express {
    interface Request {
      user: HttpUser;
    }
  }
}
