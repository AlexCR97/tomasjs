import path from "path";

export const environment = {
  name: "test",
  host: {
    /** The path of the hosting directory. This is the directory where the node process is running. */
    path: path.join(__dirname, ".."),

    /** The path of the /src directory  */
    srcPath: __dirname,

    /** The path of the /dist directory */
    distPath: path.join(__dirname, "..", "/dist"),

    /** The path of the /web directory */
    webPath: path.join(__dirname, "..", "/web"),
  },
  api: {
    port: 3031,
    basePath: "api",
  },
  mongo: {
    connectionString: "mongodb://127.0.0.1:27017",
    database: "express-plus-plus", // TODO Figure out a cooler name
    entities: ["./dist/core/entities/base", "./dist/core/entities"],
    entitiesTs: ["./src/core/entities/base", "./src/core/entities"],
  },
};
