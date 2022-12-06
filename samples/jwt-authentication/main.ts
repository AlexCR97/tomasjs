import "reflect-metadata";
import { AppBuilder } from "../../src/builder";
import { AuthorizedCallHandler, GetTokenHandler } from "./handlers";

const PORT = 3030;

async function main() {
  console.log("Creating JWT Authentication app...");

  const app = new AppBuilder()
    .useJson()
    .useHttpContext()
    .useRequestHandler(GetTokenHandler)
    .useRequestHandler(AuthorizedCallHandler);

  await app.buildAsync(PORT);

  console.log("App is running!");
}

main();
