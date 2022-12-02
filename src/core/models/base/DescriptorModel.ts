import { AutoMap } from "@automapper/classes";

export abstract class DescriptorModel {
  id!: string;

  @AutoMap()
  codeValue!: string;

  @AutoMap()
  description!: string;

  @AutoMap()
  shortDescription!: string;
}
