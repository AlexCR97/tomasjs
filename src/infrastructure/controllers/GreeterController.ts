import { BaseController } from "@/core/httpx/controllers";
import { ILogger, ILoggerProvider, ILoggerProviderToken } from "@/core/logger";
import { Request, Response } from "express";
import { inject, injectable } from "tsyringe";

@injectable()
export class GreeterController extends BaseController {
  route = "greeter";

  private readonly logger: ILogger;

  constructor(@inject(ILoggerProviderToken) private readonly loggerProvider: ILoggerProvider) {
    super();

    this.logger = this.loggerProvider.createLogger(GreeterController.name);

    this.get("/", (req: Request, res: Response) => {
      this.logger.debug("GET to /greeter");
      return res.send("Greeter works!");
    });

    this.get("/greet", (req: Request, res: Response) => {
      this.logger.debug("GET to /greeter/greet");
      return res.json({ message: "Hello!" });
    });

    this.post("/greet", (req: Request, res: Response) => {
      this.logger.debug("POST to /greeter/greet");
      const { name } = req.body;
      return res.json({ message: `Hello ${name}!` });
    });
  }
}
