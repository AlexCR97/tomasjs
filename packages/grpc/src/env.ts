import path from "path";

export const env = {
  host: {
    proto: {
      path: path.join(path.resolve(), "proto"),
    },
  },
} as const;
