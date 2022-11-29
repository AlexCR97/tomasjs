import { createMap } from "@automapper/core";
import { User } from "@/core/entities/User";
import { UserModel } from "@/core/models/UserModel";
import { Mapper } from "./Mapper";
import { SignUpUserCommand } from "@/core/cqrs/users";

createMap(Mapper, User, UserModel);
createMap(Mapper, UserModel, User);
createMap(
  Mapper,
  SignUpUserCommand,
  User
  // TODO Figure out how to map MongoDB ObjectId (mapper throwing BSONTypeError)
  // forMember(
  //   (user) => user._id,
  //   mapFrom((command) => {
  //     // const objId = ObjectId.createFromHexString(command.id);
  //     const objId = new ObjectId(command.id);
  //     console.log("objId", objId);
  //     return objId;
  //   })
  // ),
  // forMember(
  //   (user) => user.id,
  //   mapFrom((command) => command.id)
  // )
);
