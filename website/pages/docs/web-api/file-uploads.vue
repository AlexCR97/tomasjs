<script setup lang="ts">
import { MenuItem } from "utils";

const exampleSection: MenuItem = {
  id: "exampleSection",
  to: `#exampleSection`,
  label: "Example",
};

const nextStepsSection: MenuItem = {
  id: "nextSteps",
  to: "#nextSteps",
  label: "Next Steps",
};

const onThisPageItems: MenuItem[] = [exampleSection, nextStepsSection];
</script>

<template>
  <NuxtLayout name="article">
    <template #sidebarLeft>
      <DocsSidebarLeft />
    </template>

    <main class="container py-4">
      <h3 class="mb-5">File Uploads</h3>

      <section
        :id="exampleSection.id"
        class="mb-5">
        <h4 class="mb-4">{{ exampleSection.label }}</h4>

        <Code
          code='
import "reflect-metadata";
import fs from "fs";
import { OkResponse } from "@tomasjs/express";
import { AppBuilder } from "@tomasjs/express/builder";
import {
  FormFile,
  FormFiles,
  UseControllers,
  UseFiles,
  controller,
  file,
  files,
  httpPost,
} from "@tomasjs/express/controllers";
import { TomasLogger } from "@tomasjs/logging";

@controller("files")
class FilesController {
  @httpPost("single")
  uploadSingleFile(@file("file1") file1: FormFile) {
    this.saveFile(file1);
    return new OkResponse();
  }

  @httpPost("multiple")
  uploadMultipleFiles(@file("file1") file1: FormFile, @file("file2") file2: FormFile) {
    this.saveFiles([file1, file2]);
    return new OkResponse();
  }

  @httpPost("all")
  uploadAllFiles(@files() formFiles: FormFiles) {
    const files = Object.keys(formFiles)
      .map((key) => formFiles[key])
      .map((fileOrFiles) => (Array.isArray(fileOrFiles) ? fileOrFiles : [fileOrFiles]))
      .flat();

    this.saveFiles(files);

    return new OkResponse();
  }

  private saveFile(file: FormFile) {
    fs.writeFileSync(file.name, file.data);
  }

  private saveFiles(files: FormFile[]) {
    for (const file of files) {
      this.saveFile(file);
    }
  }
}

async function main() {
  const logger = new TomasLogger(main.name, "debug");

  logger.debug("Building app...");

  await new AppBuilder({ logger: new TomasLogger(AppBuilder.name, "debug") })
    .use(
      new UseFiles({
        options: {},
        logger: new TomasLogger(UseFiles.name, "debug"),
      })
    )
    .use(
      new UseControllers({
        controllers: [FilesController],
        logger: new TomasLogger(UseControllers.name, "debug"),
      })
    )
    .buildAsync();

  logger.debug("App built!");
}

main();
        ' />
      </section>

      <section
        :id="nextStepsSection.id"
        class="mb-5">
        <p class="fw-bold">{{ nextStepsSection.label }}</p>
        <ul>
          <li>
            <!-- TODO Insert link -->
            <NuxtLink to="#">Database Clients</NuxtLink>
          </li>
        </ul>
      </section>
    </main>

    <template #sidebarRight>
      <DocsSidebarRight :items="onThisPageItems" />
    </template>
  </NuxtLayout>
</template>
