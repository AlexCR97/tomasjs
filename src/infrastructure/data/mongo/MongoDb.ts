import { ILogger, ILoggerProvider, ILoggerProviderToken } from "@/core/logger";
import { inject, injectable } from "tsyringe";
import { MikroOrmInstance } from "./MikroOrmInstance";

@injectable()
export class MongoDb {
    private readonly logger: ILogger;

    constructor(
        @inject(ILoggerProviderToken)
        private readonly loggerProvider: ILoggerProvider
    ) {
        this.logger = this.loggerProvider.createLogger(MongoDb.name);
        this.logger.debug(`new ${MongoDb.name}`);
    }

    get em() {
        return MikroOrmInstance.instance.orm.em;
    }
}
