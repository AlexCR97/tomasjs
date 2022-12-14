import "reflect-metadata";
import { AppBuilder, ContainerBuilder } from "tomasjs/builder";
import { MikroOrmSetup, RepositorySetup } from "tomasjs/mikro-orm";
import {
  GetAllUsersEndpoint,
  GetUserByIdEndpoint,
  CreateUserEndpoint,
  UpdateUserEndpoint,
  UpdateUserProfileEndpoint,
  DeleteUserEndpoint,
  SeedUsersEndpoint,
  ClearUsersEndpoint,
} from "./endpoints/users";
import { User } from "./entities/User";

const PORT = 3030;

async function main() {
  console.log("Creating Endpoints app...");

  await new ContainerBuilder()
    .setup(
      new MikroOrmSetup({
        clientUrl: "mongodb://127.0.0.1:27017",
        dbName: "tomasjs-sample-crud-with-endpoints",
        entities: [User],
        allowGlobalContext: true,
        type: "mongo",
      })
    )
    .setup(new RepositorySetup("mongo", User))
    .buildAsync();

  await new AppBuilder()
    .useJson()
    .useEndpointGroup((endpoints) =>
      endpoints
        .basePath("/users")
        .useEndpoint(GetAllUsersEndpoint)
        .useEndpoint(GetUserByIdEndpoint)
        .useEndpoint(CreateUserEndpoint)
        .useEndpoint(UpdateUserEndpoint)
        .useEndpoint(UpdateUserProfileEndpoint)
        .useEndpoint(DeleteUserEndpoint)
        .useEndpoint(SeedUsersEndpoint)
        .useEndpoint(ClearUsersEndpoint)
    )
    .buildAsync(PORT);

  console.log("App is running!");
}

main();
