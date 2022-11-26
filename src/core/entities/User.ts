import { Entity, OneToOne, Property } from "@mikro-orm/core";
import { AutoMap } from "@automapper/classes";
import { RecordEntity } from "./base/RecordEntity";
import { RoleDescriptor } from "./RoleDescriptor";

@Entity()
export class User extends RecordEntity {
  @Property()
  @AutoMap()
  email!: string;

  @Property()
  password!: string;

  @Property({ nullable: true })
  @AutoMap()
  firstName?: string;

  @Property({ nullable: true })
  @AutoMap()
  lastName?: string;

  @OneToOne()
  @AutoMap()
  roleDescriptor!: RoleDescriptor;
}
