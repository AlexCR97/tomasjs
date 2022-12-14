import { User } from "@/entities/User";
import { HttpContext } from "tomasjs/core";
import { Endpoint } from "tomasjs/endpoints";
import { inRepository, Repository } from "tomasjs/mikro-orm/mongodb";
import { injectable } from "tsyringe";

@injectable()
export class GetAllUsersEndpoint extends Endpoint {
  constructor(
    @inRepository(User) private readonly usersRepository: Repository<User>
  ) {
    super();
  }
  async handle(context: HttpContext) {
    return await this.usersRepository.findAll();
  }
}
