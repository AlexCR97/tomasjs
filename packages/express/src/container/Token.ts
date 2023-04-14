import { ClassConstructor } from "./ClassConstructor";

export type Token<T> = string | ClassConstructor<T>;
