import { pipe } from "@/system";
import { LogData, LogDataValue } from "./LogData";
import { LogLevel } from "./LogLevel";

interface ILog {
  category: string;
  level: LogLevel;
  timestamp: Date;
  template: string;
  templateData: LogData;
  format: string;
  message(): string;
}

export class Log implements ILog {
  private constructor(
    readonly template: string,
    readonly templateData: LogData,
    readonly format: string
  ) {}

  get category(): string {
    return this.templateData["category"] as string;
  }

  get level(): LogLevel {
    return this.templateData["level"] as LogLevel;
  }

  get timestamp(): Date {
    return this.templateData["timestamp"] as Date;
  }

  message(): string {
    return pipe()
      .pipe(() => render(this.template, this.templateData))
      .pipe((message) => render(this.format, { ...this.templateData, message }))
      .get();

    function render(template: string, data: LogData): string {
      let message = template;

      for (const key in data) {
        const unknownValue = data[key];
        const colorize = key !== "timestamp" && key !== "message";
        const stringValue = LogDataValue.from(unknownValue, { colorize }).toString();
        message = message.replace(`{${key}}`, stringValue);
      }

      return message;
    }
  }

  static readonly DEFAULT_DATA_KEYS = {
    category: "category",
    level: "level",
    timestamp: "timestamp",
    message: "message",
  } as const;

  static readonly DEFAULT_FORMAT =
    `{${this.DEFAULT_DATA_KEYS.timestamp}} {${this.DEFAULT_DATA_KEYS.level}} {${this.DEFAULT_DATA_KEYS.message}}` as const;

  static create(options: {
    category: string;
    level: LogLevel;
    timestamp: Date;
    template: string;
    templateData: LogData;
    format: string;
  }): Log {
    const finalTemplateData: LogData = {
      category: options.category,
      level: options.level,
      timestamp: options.timestamp,
      ...options.templateData,
    };

    return new Log(options.template, finalTemplateData, options.format);
  }

  static default(template: string, templateData: LogData): Log {
    return this.create({
      category: "default",
      level: "debug",
      timestamp: new Date(),
      template,
      templateData,
      format: this.DEFAULT_FORMAT,
    });
  }
}
