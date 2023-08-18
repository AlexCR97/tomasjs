import { Container } from "@tomasjs/core";
import { Express } from "express";

export type AppTeardownFunction = (app: Express, container: Container) => void | Promise<void>;
