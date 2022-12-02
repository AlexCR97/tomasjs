import { ILogger, ILoggerProvider, ILoggerProviderToken } from "@/core/logger";
import { inject, injectable } from "tsyringe";
import { MikroOrmInstance } from "./MikroOrmInstance";

@injectable()
export class MongoDb {
  private readonly logger: ILogger;

  constructor(@inject(ILoggerProviderToken) private readonly loggerProvider: ILoggerProvider) {
    this.logger = this.loggerProvider.createLogger(MongoDb.name, { level: "info" });
    this.logger.debug(`new ${MongoDb.name}`);
  }

  // TODO Add return type
  get em() {
    return MikroOrmInstance.instance.orm.em;
  }
}
