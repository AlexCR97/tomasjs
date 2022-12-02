import { UserModel } from "@/core/models/UserModel";
import { Query } from "../core/queries";

export class GetUserByEmailQuery extends Query<UserModel> {
  constructor(readonly email: string) {
    super();
  }
}
