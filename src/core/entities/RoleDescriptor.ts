import { Entity } from "@mikro-orm/core";
import { DescriptorEntity } from "./base/DescriptorEntity";

@Entity()
export class RoleDescriptor extends DescriptorEntity {}
