export const appconfig = {
  logging: {
    minimumLevel: {
      default: "warn",
      override: {
        "@tomasjs/cli": "info",
        MegaTemplateDownloader: "warn",
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
      mega: {
        empty: "https://mega.nz/file/k2sAUKjY#gX8LJjwtF3f2ZiDS9SG49WBYE6gwJbkx3iwxJzRjP0k",
        console: "https://mega.nz/file/gy9wwTzZ#t3NaXEh33HGwvIZaR-V22bmOUTHdfjZz3qUgaxKLNbo",
      },
    },
  },
} as const;
