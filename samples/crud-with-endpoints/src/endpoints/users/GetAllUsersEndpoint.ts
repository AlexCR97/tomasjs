import { User } from "@/entities/User";
import { HttpContext } from "tomasjs/core";
import { Endpoint } from "tomasjs/endpoints";
import { MongoRepositoryName, MongoRepository } from "tomasjs/mikro-orm/mongodb";
import { inject, injectable } from "tsyringe";

@injectable()
export class GetAllUsersEndpoint extends Endpoint {
  constructor(
    @inject(MongoRepositoryName(User)) private readonly usersRepository: MongoRepository<User>
  ) {
    super();
  }
  async handle(context: HttpContext) {
    return await this.usersRepository.findAll();
  }
}
