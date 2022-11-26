import { AutoMap } from "@automapper/classes";
import { Entity, PrimaryKey, Property, SerializedPrimaryKey, Unique } from "@mikro-orm/core";
import { ObjectId } from "@mikro-orm/mongodb";

@Entity({ abstract: true })
export abstract class DescriptorEntity {
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

  @Property()
  @Unique()
  @AutoMap()
  codeValue!: string;

  @Property()
  @Unique()
  @AutoMap()
  description!: string;

  @Property()
  @Unique()
  @AutoMap()
  shortDescription!: string;
}
