export const environment = {
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
