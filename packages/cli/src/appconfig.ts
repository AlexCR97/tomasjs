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
        empty: "https://mega.nz/file/dnUASRIK#RjfTY6vx_nY9fdlQRHNUk7SnQ7CJG-wx7F_S03xI4Vw",
      },
    },
  },
} as const;
