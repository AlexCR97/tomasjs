import "reflect-metadata";
import { AppBuilder } from "../../src/builder";
import {
  CreateUserHandler,
  DeleteUserHandler,
  GetAllUsersHandler,
  GetUserByIdHandler,
  UpdateUserHandler,
  UpdateUserProfileHandler,
} from "./UserRequests";

const PORT = 3030;

async function main() {
  console.log("Creating RequestHandlers app...");

  const app = new AppBuilder()
    .useJson()
    .useHttpContext()
    .useRequestHandler(GetAllUsersHandler)
    .useRequestHandler(GetUserByIdHandler)
    .useRequestHandler(CreateUserHandler)
    .useRequestHandler(UpdateUserHandler)
    .useRequestHandler(UpdateUserProfileHandler)
    .useRequestHandler(DeleteUserHandler);

  await app.buildAsync(PORT);

  console.log("App is running!");
}

main();
