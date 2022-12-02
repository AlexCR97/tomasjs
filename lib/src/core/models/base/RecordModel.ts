import { AutoMap } from "@automapper/classes";

export abstract class RecordModel {
  id!: string;

  @AutoMap()
  createdBy?: string;

  @AutoMap()
  createdDate!: Date;

  @AutoMap()
  deleted?: boolean;

  @AutoMap()
  deletedBy?: string;

  @AutoMap()
  deletedDate?: Date;

  @AutoMap()
  updatedBy?: string;

  @AutoMap()
  updatedDate!: Date;
}
