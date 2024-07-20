export const appconfig = {
  logging: {
    minimumLevel: {
      default: "warn",
      override: {
        "@tomasjs/cli": "info",
        MegaTemplateDownloader: "warn",
        InitCommand: "warn",
      },
    },
  },
  templateDownloader: {
    use: "mega",
    strategies: {
      mega: {
        empty: "https://mega.nz/file/k2sAUKjY#gX8LJjwtF3f2ZiDS9SG49WBYE6gwJbkx3iwxJzRjP0k",
        console: "https://mega.nz/file/gy9wwTzZ#t3NaXEh33HGwvIZaR-V22bmOUTHdfjZz3qUgaxKLNbo",
      },
    },
  },
} as const;
