#! /usr/bin/env node

import "reflect-metadata";
import { mainCommand } from "@/commands/main";

mainCommand.parse(process.argv);
