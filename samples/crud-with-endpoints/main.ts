import "reflect-metadata";
import { AppBuilder } from "../../src/builder";
import {
  GetAllUsersEndpoint,
  GetUserByIdEndpoint,
  CreateUserEndpoint,
  UpdateUserEndpoint,
  UpdateUserProfileEndpoint,
  DeleteUserEndpoint,
  SeedUsersEndpoint,
  ClearUsersEndpoint,
} from "./UserEndpoints";

const PORT = 3030;

async function main() {
  console.log("Creating Endpoints app...");

  const app = new AppBuilder()
    .useJson()
    .useEndpoint(GetAllUsersEndpoint)
    .useEndpoint(GetUserByIdEndpoint)
    .useEndpoint(CreateUserEndpoint)
    .useEndpoint(SeedUsersEndpoint)
    .useEndpoint(UpdateUserEndpoint)
    .useEndpoint(UpdateUserProfileEndpoint)
    .useEndpoint(DeleteUserEndpoint)
    .useEndpoint(ClearUsersEndpoint);

  await app.buildAsync(PORT);

  console.log("App is running!");
}

main();

