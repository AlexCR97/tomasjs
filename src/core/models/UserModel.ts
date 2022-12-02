import { AutoMap } from "@automapper/classes";
import { DescriptorModel } from "./base/DescriptorModel";
import { RecordModel } from "./base/RecordModel";

export class UserModel extends RecordModel {
  @AutoMap()
  email!: string;

  @AutoMap()
  firstName?: string;

  @AutoMap()
  lastName?: string;

  @AutoMap()
  roleDescriptor!: DescriptorModel;
  roleDescriptorId!: string;
}
