import "reflect-metadata";
import { inject } from "./@inject";
import { ServiceA } from "./ServiceA_test";

/**
 * This class is used for internal testing only.
 */
export class ServiceB {
  constructor(@inject(ServiceA) readonly serviceA: ServiceA) {}
}
