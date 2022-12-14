import "reflect-metadata";
import { AppBuilder } from "tomasjs/builder";
import { AuthenticatedEndpoint, AuthorizedEndpoint, GetTokenEndpoint } from "./endpoints";

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
