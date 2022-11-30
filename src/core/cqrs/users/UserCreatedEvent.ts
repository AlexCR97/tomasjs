import { AutoMap } from "@automapper/classes";
import { Event } from "../core/events";

export class UserCreatedEvent extends Event {
  @AutoMap()
  id!: string;

  @AutoMap()
  email!: string;

  @AutoMap()
  password!: string;
}
