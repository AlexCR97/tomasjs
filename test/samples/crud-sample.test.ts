import "reflect-metadata";
import { afterEach, describe, it } from "@jest/globals";
import { StatusCodes } from "../../src/core";
import fetch from "node-fetch";
import { seedUsersCount } from "../../samples/crud-with-endpoints/UserEndpoints";

export interface User {
  id: number;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

// Test suite name must be crud-sample because of npm script "test-sample-crud-watch"
describe("crud-sample", () => {
  const port = 3030;
  const serverAddress = `http://localhost:${port}`;

  beforeEach(async () => {
    await fetch(`${serverAddress}/users/clear`, { method: "delete" });
    await fetch(`${serverAddress}/users/seed`, { method: "post" });
  });

  afterEach(async () => {
    await fetch(`${serverAddress}/users/clear`, { method: "delete" });
    await fetch(`${serverAddress}/users/seed`, { method: "post" });
  });

  it("Can get all users", async () => {
    // Arrange
    const endpointUrl = `${serverAddress}/users`;

    // Act
    const response = await fetch(endpointUrl);

    // Assert
    expect(response.status).toBe(StatusCodes.ok);

    const users: User[] = await response.json();
    expect(users.length).toBe(seedUsersCount);
  });

  it("Can get a user by id", async () => {
    // Arrange
    const expectedUserId = 1;
    const endpointUrl = `${serverAddress}/users/${expectedUserId}`;

    // Act
    const response = await fetch(endpointUrl);

    // Assert
    expect(response.status).toBe(StatusCodes.ok);

    const user: User = await response.json();
    expect(user.id).toBe(expectedUserId);
  });

  it("Can create a user", async () => {
    // Arrange
    const expectedCreatedUser: User = {
      id: undefined as any,
      email: "unique_address@test.com",
      password: "secret-password-123",
      firstName: "TestFirstName",
      lastName: "TestLastName",
    };
    const expectedUsersCountAfterCreate = seedUsersCount + 1;

    // Act/Assert (create user)
    const createUserResponse = await fetch(`${serverAddress}/users`, {
      method: "post",
      body: JSON.stringify(expectedCreatedUser),
      headers: { "Content-Type": "application/json" },
    });
    expect(createUserResponse.status).toBe(StatusCodes.created);

    const createdUserIdStr = await createUserResponse.text();
    expect(createdUserIdStr).toBeTruthy();

    const createdUserId = Number(createdUserIdStr);
    expect(createdUserId).toBeTruthy();

    // Act/Assert (verify users count)
    const getAllUsersResponse = await fetch(`${serverAddress}/users`);
    expect(getAllUsersResponse.status).toBe(StatusCodes.ok);

    const allUsers: User[] = await getAllUsersResponse.json();
    expect(allUsers.length).toBe(expectedUsersCountAfterCreate);

    // Act/Assert (get created user)
    const getCreatedUserResponse = await fetch(`${serverAddress}/users/${createdUserId}`);
    expect(getCreatedUserResponse.status).toBe(StatusCodes.ok);

    const createdUser: User = await getCreatedUserResponse.json();
    expect(createdUser.id).toBe(createdUserId);
    expect(createdUser.email).toEqual(expectedCreatedUser.email);
    expect(createdUser.password).toEqual(expectedCreatedUser.password);
    expect(createdUser.firstName).toEqual(expectedCreatedUser.firstName);
    expect(createdUser.lastName).toEqual(expectedCreatedUser.lastName);
  });

  it("Can update a user", async () => {
    // Arrange
    const userId = 1;
    const expectedUserBeforeUpdate: User = {
      id: userId,
      email: "user1@domain.com",
      password: "user1@123456",
      firstName: undefined,
      lastName: undefined,
    };
    const expectedUserAfterUpdate: User = {
      id: userId,
      email: "user1_UPDATE@domain.com",
      password: "user1@123456_UPDATE",
      firstName: "UpdatedFirstName",
      lastName: "UpdatedLastName",
    };

    // Act/Assert (get existing user)
    const getByIdResponse = await fetch(`${serverAddress}/users/${userId}`);
    expect(getByIdResponse.status).toBe(StatusCodes.ok);

    const existingUser: User = await getByIdResponse.json();
    expect(existingUser.id).toBe(expectedUserBeforeUpdate.id);
    expect(existingUser.email).toEqual(expectedUserBeforeUpdate.email);
    expect(existingUser.password).toEqual(expectedUserBeforeUpdate.password);
    expect(existingUser.firstName).toEqual(expectedUserBeforeUpdate.firstName);
    expect(existingUser.lastName).toEqual(expectedUserBeforeUpdate.lastName);

    // Act/Assert (update user)
    existingUser.id = expectedUserAfterUpdate.id;
    existingUser.email = expectedUserAfterUpdate.email;
    existingUser.password = expectedUserAfterUpdate.password;
    existingUser.firstName = expectedUserAfterUpdate.firstName;
    existingUser.lastName = expectedUserAfterUpdate.lastName;

    const updateResponse = await fetch(`${serverAddress}/users/${userId}`, {
      method: "put",
      body: JSON.stringify(existingUser),
      headers: { "Content-Type": "application/json" },
    });
    expect(updateResponse.status).toBe(StatusCodes.noContent);

    // Act/Assert (verify state after update)
    const userAfterUpdateResponse = await fetch(`${serverAddress}/users/${userId}`);
    expect(userAfterUpdateResponse.status).toBe(StatusCodes.ok);

    const existingUserAfterUpdate: User = await userAfterUpdateResponse.json();
    expect(existingUserAfterUpdate.id).toBe(expectedUserAfterUpdate.id);
    expect(existingUserAfterUpdate.email).toEqual(expectedUserAfterUpdate.email);
    expect(existingUserAfterUpdate.password).toEqual(expectedUserAfterUpdate.password);
    expect(existingUserAfterUpdate.firstName).toEqual(expectedUserAfterUpdate.firstName);
    expect(existingUserAfterUpdate.lastName).toEqual(expectedUserAfterUpdate.lastName);
  });

  it("Can delete a user", async () => {
    // Arrange
    const userId = 3;
    const expectedUsersCountAfterDelete = 2;

    // Act/Assert (get all users before delete)
    const usersBeforeDeleteResponse = await fetch(`${serverAddress}/users`);
    expect(usersBeforeDeleteResponse.status).toBe(StatusCodes.ok);

    const usersBeforeDelete: User[] = await usersBeforeDeleteResponse.json();
    expect(usersBeforeDelete.length).toBe(seedUsersCount);

    // Act/Assert (delete user)
    const deleteResponse = await fetch(`${serverAddress}/users/${userId}`, {
      method: "delete",
    });
    expect(deleteResponse.status).toBe(StatusCodes.noContent);

    // Act/Assert (get all users before delete)
    const usersAfterDeleteResponse = await fetch(`${serverAddress}/users`);
    expect(usersAfterDeleteResponse.status).toBe(StatusCodes.ok);

    const usersAfterDelete: User[] = await usersAfterDeleteResponse.json();
    expect(usersAfterDelete.length).toBe(expectedUsersCountAfterDelete);
  });
});
