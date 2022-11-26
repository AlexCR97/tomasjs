import { WinstonLoggerProvider } from "./shared/logger/WinstonLoggerProvider";

const logger = new WinstonLoggerProvider().createLogger("main.ts");
logger.debug("This is a log!", { someField: "This is some metadata!" });
