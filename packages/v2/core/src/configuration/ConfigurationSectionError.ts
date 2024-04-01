import { TomasError } from "@/errors/TomasError";

export class ConfigurationSectionError extends TomasError {
  constructor(rootPath: string, sectionPath: string) {
    super(
      "core/configuration/SectionNotFound",
      `No such configuration section in path "${sectionPath}"`,
      {
        data: {
          rootPath,
          sectionPath,
        },
      }
    );
  }
}
