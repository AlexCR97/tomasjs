import { Command } from "commander";
import { projectCommand } from "@/commands/project/project";

export const mainCommand = new Command()
  .name("tomasjs")
  .description("The official CLI for TomasJS")
  .version("1.0.0")
  .addCommand(projectCommand);
