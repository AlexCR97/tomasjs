import { AsyncRequestHandler, RequestContext } from "@/requests";
import { StatusCodeResponse } from "@/responses";
import { IUserRepository, IUserRepositoryToken } from "@/infrastructure/data/repositories/users";
import { inject, injectable } from "tsyringe";
import { StatusCodes } from "@/StatusCodes";

@injectable()
export class UpdateProfileRequestHandler extends AsyncRequestHandler<StatusCodeResponse> {
  constructor(@inject(IUserRepositoryToken) readonly userRepository: IUserRepository) {
    super();
  }

  async handleAsync(context: RequestContext): Promise<StatusCodeResponse> {
    const userId = context.params.id;
    const user = await this.userRepository.getByIdAsync(userId);
    user.firstName = context.body.firstName;
    user.lastName = context.body.lastName;
    await this.userRepository.updateAsync(userId, user);
    return new StatusCodeResponse(StatusCodes.noContent);
  }
}
