import "reflect-metadata";
import { Log } from "./Log";

describe("logging/Log", () => {
  it("can render", () => {
    const messageTemplate = "Hello {name}";
    const log = Log.default(messageTemplate, { name: "world!" });
    process.stdout.write(`log.category: ${log.category}\n`);
    process.stdout.write(`log.level: ${log.level}\n`);
    process.stdout.write(`log.timestamp: ${log.timestamp}\n`);
    process.stdout.write(`log.template: ${log.template}\n`);
    process.stdout.write(`log.templateData: ${JSON.stringify(log.templateData)}\n`);
    process.stdout.write(`log.message(): ${log.message()}\n`);
  });
});
