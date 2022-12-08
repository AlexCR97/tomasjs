import "reflect-metadata";
import { AppBuilder } from "../../src/builder";
import { AuthenticatedEndpoint, AuthorizedEndpoint, GetTokenEndpoint } from "./handlers";

const PORT = 3030;

async function main() {
  console.log("Creating JWT Authentication app...");

  const app = new AppBuilder()
    .useJson()
    .useEndpoint(GetTokenEndpoint)
    .useEndpoint(AuthenticatedEndpoint)
    .useEndpoint(AuthorizedEndpoint);

  await app.buildAsync(PORT);

  console.log("App is running!");
}

main();
