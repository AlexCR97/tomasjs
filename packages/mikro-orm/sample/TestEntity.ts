import { Entity, PrimaryKey } from "@mikro-orm/core";
import { ObjectId } from "@mikro-orm/mongodb";

//@ts-ignore
@Entity()
export class TestEntity {
  //@ts-ignore
  @PrimaryKey()
  _id!: ObjectId;
}
