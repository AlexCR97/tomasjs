import {} from "@/core/HttpUser";

declare global {
  namespace Express {
    interface Request {
      user: HttpUser;
    }
  }
}
