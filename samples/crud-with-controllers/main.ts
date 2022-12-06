import "reflect-metadata";
import { AppBuilder } from "../../src/builder";
import { UserController } from "./UserController";

const PORT = 3030;

async function main() {
  console.log("Creating app...");
  const app = new AppBuilder().useJson().useController(UserController);
  await app.buildAsync(PORT);
  console.log("App is running!");
}

main();
