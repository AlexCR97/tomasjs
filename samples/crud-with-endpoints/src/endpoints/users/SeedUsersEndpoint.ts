import { User } from "@/entities/User";
import { HttpContext } from "tomasjs/core";
import { Endpoint } from "tomasjs/endpoints";
import { inRepository, Repository } from "tomasjs/mikro-orm/mongodb";
import { OkResponse } from "tomasjs/responses/status-codes";
import { injectable } from "tsyringe";

@injectable()
export class SeedUsersEndpoint extends Endpoint {
  static readonly seedUsersCount = 3;

  constructor(
    @inRepository(User) private readonly usersRepository: Repository<User>
  ) {
    super();
    this.method("post").path("/seed");
  }

  async handle(context: HttpContext) {
    const arr = Array.from(Array(SeedUsersEndpoint.seedUsersCount).keys());

    for (const index of arr) {
      await this.usersRepository.nativeInsert({
        email: `user${index + 1}@domain.com`,
        password: `user${index + 1}@123456`,
      });
    }

    return new OkResponse();
  }
}
