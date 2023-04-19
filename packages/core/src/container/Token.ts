import { ClassConstructor } from "@/reflection";

export type Token<T> = string | ClassConstructor<T>;
