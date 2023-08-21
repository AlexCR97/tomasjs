import path from "path";

export const env = {
  host: {
    path: path.resolve(),
  },
  azure: {
    storageAccount: {
      connectionString:
        "DefaultEndpointsProtocol=https;AccountName=tomasjs;AccountKey=/13y4LySh1WKaevyV0B40+myqBy/B2CHPQ7usY1DhxHtL0EAIdSlvbBUDpuPFeDmqagCgnaKBOmh+AStr4W/vQ==;BlobEndpoint=https://tomasjs.blob.core.windows.net/;QueueEndpoint=https://tomasjs.queue.core.windows.net/;TableEndpoint=https://tomasjs.table.core.windows.net/;FileEndpoint=https://tomasjs.file.core.windows.net/;",
      containerName: "project-templates",
    },
  },
  projectTemplates: {
    console: "console",
    express: "express",
  },
} as const;
