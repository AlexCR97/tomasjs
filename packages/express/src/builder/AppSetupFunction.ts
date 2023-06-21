import { Container } from "@tomasjs/core";
import { Express } from "express";

export type AppSetupFunction = (app: Express, container: Container) => void | Promise<void>;
