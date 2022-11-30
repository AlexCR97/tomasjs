import { StatusCodes } from "@/api/core";
import { AsyncRequestHandler, RequestContext } from "@/core/requests/core";
import { StatusCodeResponse } from "@/core/requests/core/responses";
import { IUserRepository, IUserRepositoryToken } from "@/infrastructure/data/repositories/users";
import { inject, injectable } from "tsyringe";

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
