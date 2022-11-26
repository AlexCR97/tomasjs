import { AutoMap } from "@automapper/classes";
import { Entity, PrimaryKey, Property, SerializedPrimaryKey } from "@mikro-orm/core";
import { ObjectId } from "@mikro-orm/mongodb";

@Entity({ abstract: true })
export abstract class RecordEntity {
  @PrimaryKey()
  _id!: ObjectId;

  @SerializedPrimaryKey()
  id!: string;

  @Property({ nullable: true })
  @AutoMap()
  createdBy?: string;

  @Property({ onCreate: () => new Date() })
  @AutoMap()
  createdDate!: Date;

  @Property({ nullable: true })
  @AutoMap()
  deleted?: boolean;

  @Property({ nullable: true })
  @AutoMap()
  deletedBy?: string;

  @Property({ nullable: true })
  @AutoMap()
  deletedDate?: Date;

  @Property({ nullable: true })
  @AutoMap()
  updatedBy?: string;

  @Property({ onCreate: () => new Date(), onUpdate: () => new Date() })
  @AutoMap()
  updatedDate!: Date;
}
