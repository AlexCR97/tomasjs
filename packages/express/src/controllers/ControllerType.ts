import { ClassConstructor } from "@tomasjs/core";
import { Controller } from "./Controller";

export type ControllerType<TController extends Controller = Controller> =
  | TController
  | ClassConstructor<TController>;
