import { Configuration } from "@mikro-orm/core";

export type DatabaseDriver = keyof typeof Configuration.PLATFORMS;
