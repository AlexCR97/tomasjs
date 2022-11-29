import { createMap } from "@automapper/core";
import { User } from "@/core/entities/User";
import { UserModel } from "@/core/models/UserModel";
import { Mapper } from "./Mapper";

createMap(Mapper, User, UserModel);
createMap(Mapper, UserModel, User);
