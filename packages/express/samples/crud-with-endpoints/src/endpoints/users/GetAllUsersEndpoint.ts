import { HttpContext } from "tomasjs/core";
import { endpoint, Endpoint } from "tomasjs/endpoints";
import { inRepository, Repository } from "tomasjs/mikro-orm/mongodb";
import { User } from "@/entities/User";

@endpoint()
export class GetAllUsersEndpoint implements Endpoint {
  constructor(@inRepository(User) private readonly usersRepository: Repository<User>) {}

  async handle(context: HttpContext) {
    return await this.usersRepository.findAll();
  }
}
