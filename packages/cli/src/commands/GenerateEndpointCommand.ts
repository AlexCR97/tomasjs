import { files } from "@/infrastructure/services";
// import endpointTemplate from "@/template/src/endpoints/EndpointTemplate";
import { Command } from "commander";
import path from "path";

export const GenerateEndpointCommand = new Command()
  .name("endpoint")
  .argument("<path>")
  .description("Generates an endpoint")
  .action((pathArg: string) => {
    // console.log("pathArg", pathArg);

    const { endpointDirectory, endpointName, endpointPath } = getEndpointFileMetadata(pathArg);
    // console.log("endpointDirectory", endpointDirectory);
    // console.log("endpointName", endpointName);
    // console.log("endpointPath", endpointPath);

    if (files.exists(endpointPath)) {
      throw new Error(
        `There is already an endpoint named "${endpointName}" in the path "${endpointDirectory}" ("${endpointPath}")`
      );
    }

    // const endpointContent = endpointTemplate.replace("{{name}}", endpointName);
    // console.log("endpointContent", endpointContent);

    files.ensureDirectory(endpointDirectory);
    // files.create(endpointPath, endpointContent);
  });

function getEndpointFileMetadata($path: string) {
  const pathParts = $path.split("/");
  const pathPartsWithoutFileName = pathParts.slice(0, -1);
  const endpointName = pathParts[pathParts.length - 1];
  const endpointFileName = `${endpointName}Endpoint.ts`;
  const currentDirectory = process.cwd();
  const endpointDirectory = path.join(currentDirectory, "src", ...pathPartsWithoutFileName);
  const endpointPath = path.join(
    currentDirectory,
    "src",
    ...pathPartsWithoutFileName,
    endpointFileName
  );
  return {
    endpointDirectory,
    endpointName,
    endpointPath,
  };
}
