import "reflect-metadata";
import { describe, expect, it } from "@jest/globals";
import { ServiceContainerBuilder } from "@tomasjs/core";
import { commandHandler } from "./@commandHandler";
import { CommandDispatcher } from "./CommandDispatcher";
import { CommandHandler } from "./CommandHandler";
import { UseCommands } from "./UseCommands";
import { UseServiceProvider } from "../UseServiceProvider";
import { CommandHandlerToken } from "./metadata";

describe("commands", () => {
  it(`Can register the ${CommandDispatcher.name}`, async () => {
    const services = await new ServiceContainerBuilder()
      .setup(new UseServiceProvider())
      .setup(new UseCommands())
      .buildServiceProviderAsync();

    const commandDispatcher = services.get<CommandDispatcher>(CommandDispatcher);
    expect(commandDispatcher).toBeInstanceOf(CommandDispatcher);
  });

  it("Can register a CommandHandler", async () => {
    class TestCommand {}

    //@ts-ignore: Fix decorators not working in test files
    @commandHandler(TestCommand)
    class TestCommandHandler implements CommandHandler<TestCommand> {
      execute(command: TestCommand) {}
    }

    const services = await new ServiceContainerBuilder()
      .setup(new UseServiceProvider())
      .setup(new UseCommands([TestCommandHandler]))
      .buildServiceProviderAsync();

    const commandHandlers = services.getAll<CommandHandler<any>>(CommandHandlerToken);

    expect(commandHandlers.length).toBe(1);
    expect(commandHandlers[0]).toBeInstanceOf(TestCommandHandler);
  });

  it("Can register and use a CommandHandler", async () => {
    function meow(catName: string): string {
      return `${catName} says meow`;
    }

    class MeowCommand {
      constructor(readonly catName: string) {}
    }

    //@ts-ignore: Fix decorators not working in test files
    @commandHandler(MeowCommand)
    class MeowCommandHandler implements CommandHandler<MeowCommand, string> {
      execute(command: MeowCommand): string {
        return meow(command.catName);
      }
    }

    const services = await new ServiceContainerBuilder()
      .setup(new UseServiceProvider())
      .setup(new UseCommands([MeowCommandHandler]))
      .buildServiceProviderAsync();

    const commandDispatcher = services.get<CommandDispatcher>(CommandDispatcher);
    const catName = "Tomas";
    const meowResult = await commandDispatcher.execute<string>(new MeowCommand(catName));
    expect(meowResult).toEqual(meow(catName));
  });

  it("Can register and use multiple CommandHandlers", async () => {
    function meow(catName: string): string {
      return `${catName} says meow`;
    }

    class MeowCommand {
      constructor(readonly catName: string) {}
    }

    //@ts-ignore: Fix decorators not working in test files
    @commandHandler(MeowCommand)
    class MeowCommandHandler implements CommandHandler<MeowCommand, string> {
      execute(command: MeowCommand): string {
        return meow(command.catName);
      }
    }

    function woof(dogName: string): string {
      return `${dogName} says woof`;
    }

    class WoofCommand {
      constructor(readonly dogName: string) {}
    }

    //@ts-ignore: Fix decorators not working in test files
    @commandHandler(WoofCommand)
    class WoofCommandHandler implements CommandHandler<WoofCommand, string> {
      execute(command: WoofCommand): string | Promise<string> {
        return woof(command.dogName);
      }
    }

    const services = await new ServiceContainerBuilder()
      .setup(new UseServiceProvider())
      .setup(new UseCommands([MeowCommandHandler, WoofCommandHandler]))
      .buildServiceProviderAsync();

    const commandDispatcher = services.get<CommandDispatcher>(CommandDispatcher);

    const catName = "Tomas";
    const meowResult = await commandDispatcher.execute<string>(new MeowCommand(catName));
    expect(meowResult).toEqual(meow(catName));

    const dogName = "Doki";
    const woofResult = await commandDispatcher.execute<string>(new WoofCommand(dogName));
    expect(woofResult).toEqual(woof(dogName));
  });
});
