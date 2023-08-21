import { Command } from "commander";
import { GenerateEndpointCommand } from "./GenerateEndpointCommand";

export const GenerateCommand = new Command().name("generate").addCommand(GenerateEndpointCommand);
