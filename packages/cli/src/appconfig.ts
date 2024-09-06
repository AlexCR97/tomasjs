export const appconfig = {
  logging: {
    minimumLevel: {
      default: "warn",
      override: {
        "@tomasjs/cli": "info",
        GitHubTemplateDownloader: "warn",
        InitCommand: "warn",
      },
    },
  },
  templateDownloader: {
    use: "github",
    strategies: {
      github: {
        templatesUrl:
          "https://raw.githubusercontent.com/AlexCR97/tomasjs/release/v2/templates/{templateType}/{templateType}.zip",
      },
    },
  },
} as const;
