import "reflect-metadata";
import { ContainerBuilder } from "@tomasjs/express/builder";
import { MikroOrmSetup } from "../src";
import { env } from "./env";
import { TomasLogger } from "@tomasjs/express/logger";
import { TestEntity } from "./TestEntity";

async function main() {
  await new ContainerBuilder()
    .setup(
      new MikroOrmSetup({
        options: {
          clientUrl: env.url,
          dbName: env.dbName,
          type: "mongo",
          entities: [TestEntity],
        },
        logger: new TomasLogger(MikroOrmSetup.name, "debug"),
      })
    )
    .buildAsync();
}

main();
