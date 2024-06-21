export const appconfig = {
  logging: {
    minimumLevel: {
      default: "warn",
    },
  },
  templateDownloader: {
    use: "mega",
    strategies: {
      mega: {
        empty: "https://mega.nz/file/Z28D3JBS#vqwZn_gfLRwDzpQwftHS1yQcMmlReHtx1XZk6u4Ahgo",
      },
    },
  },
} as const;
