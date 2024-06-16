import { Command } from "commander";
import { createCommand } from "@/commands/project/create";

export const projectCommand = new Command().name("project").addCommand(createCommand);
