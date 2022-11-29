import { CommandDispatcher } from "@/core/cqrs/core/commands";
import { CreateUserCommand } from "@/core/cqrs/users/CreateUserCommand";
import { IUserService, IUserServiceToken } from "@/core/services/user";
import { Request, Response } from "express";
import { inject, injectable } from "tsyringe";
import { StatusCodes } from "../core";
import { BaseController } from "./core";

@injectable()
export class UserController extends BaseController {
  route = "users";

  constructor(
    @inject(IUserServiceToken) readonly userService: IUserService,
    @inject(CommandDispatcher) readonly commandDispatcher: CommandDispatcher
  ) {
    super();

    this.get("/", async (req: Request, res: Response) => {
      const users = await userService.getAsync(req.body);
      res.json(users);
    });

    this.get("/:id", async (req: Request, res: Response) => {
      const user = await userService.getByIdAsync(req.params.id);
      res.json(user);
    });

    this.post("/", async (req: Request, res: Response) => {
      // TODO Validate model?
      const id = await userService.createAsync(req.body); // TODO Map body to UserModel class?
      res.status(StatusCodes.created).json(id);
    });

    this.put("/:id", async (req: Request, res: Response) => {
      // TODO Validate model?
      const id = await userService.updateAsync(req.params.id, req.body); // TODO Map body to UserModel class?
      res.status(StatusCodes.noContent).json(id);
    });

    this.delete("/:id", async (req: Request, res: Response) => {
      await userService.deleteAsync(req.params.id);
      res.status(StatusCodes.noContent).send();
    });

    this.get("/email/:email", async (req: Request, res: Response) => {
      const user = await userService.getByEmailAsync(req.params.email);
      res.json(user);
    });

    this.post("/signUp", async (req: Request, res: Response) => {
      commandDispatcher.dispatch(
        new CreateUserCommand({
          email: req.body.email,
        })
      );
      res.status(StatusCodes.created).send();
    });
  }
}
