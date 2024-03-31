import "reflect-metadata";
import { inject } from "./@inject";
import { ServiceB } from "./ServiceB_test";

/**
 * This class is used for internal testing only.
 */
export class ServiceA {
  constructor(@inject(ServiceB) readonly serviceB: ServiceB) {}
}
