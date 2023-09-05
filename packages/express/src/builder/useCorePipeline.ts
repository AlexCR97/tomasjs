import { HttpUser } from "@/core";
import { AppSetupFunction } from "./AppSetupFunction";

export const useCorePipeline: AppSetupFunction = (app, _) => {
  app.use((req, _, next) => {
    req.user = new HttpUser(false, false, null);
    return next();
  });
};
