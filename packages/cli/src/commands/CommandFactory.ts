import { Command } from "commander";

export interface CommandFactory {
  createCommand(): Command;
}
