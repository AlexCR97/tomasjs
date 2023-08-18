<script setup lang="ts">
  import { MenuItem } from "utils";

  const creatingTheProjectSectionId = "creatingTheProjectSection";
  const theGreeterServiceSectionId = "theGreeterServiceSection";
  const runningTheAppSectionId = "runningTheAppSection";
  const buildingTheAppSectionId = "buildingTheAppSection";
  const nextStepsSectionId = "nextStepsSection";

  const onThisPageItems: MenuItem[] = [
    {
      label: "Creating the project",
      to: `#${creatingTheProjectSectionId}`,
    },
    {
      label: "The GreeterService",
      to: `#${theGreeterServiceSectionId}`,
    },
    {
      label: "Running the app",
      to: `#${runningTheAppSectionId}`,
    },
    {
      label: "Building the app",
      to: `#${buildingTheAppSectionId}`,
    },
    {
      label: "Next steps",
      to: `#${nextStepsSectionId}`,
    },
  ];
</script>

<template>
  <NuxtLayout name="article">
    <template #sidebarLeft>
      <DocsSidebarLeft />
    </template>

    <main class="container py-4">
      <h3 class="mb-5">Your first TomasJS Console app</h3>

      <section :id="creatingTheProjectSectionId" class="mb-5">
        <h4 class="mb-4">Creating the project</h4>

        <p>You can find the starter project template from the following repo:</p>
        <p>
          <a href="https://github.com/AlexCR97/Node-Project-Templates/tree/main/app%20-%20tomasjs"
            >Node-Project-Templates / app - tomasjs</a
          >
        </p>

        <p>
          In a folder of your choice, copy the template "app - tomasjs" with your preferred method.
        </p>

        <p>This template has the necessary files to develop a console application.</p>

        <p>Install the dependencies:</p>

        <Code class="mb-4" lang="powershell" code="npm install" />
      </section>

      <section :id="theGreeterServiceSectionId" class="mb-5">
        <h4 class="mb-4">The GreeterService</h4>

        <p>Create a GreeterService.ts file:</p>

        <Code
          class="mb-4"
          title="src/GreeterService.ts"
          code='
import { injectable } from "@tomasjs/core";

@injectable()
export class GreeterService {
  greet(name: string) {
    console.log(`Hello ${name}!`);
  }
}
        '
        />

        <p>Now in your main.ts file, place the following content:</p>

        <Code
          title="src/main.ts"
          class="mb-4"
          code='
import "reflect-metadata";
import { ServiceContainerBuilder } from "@tomasjs/core";
import { GreeterService } from "./GreeterService";

async function main() {
  const serviceProvider = await new ServiceContainerBuilder()
    .addClass(GreeterService)
    .buildServiceProviderAsync();

  const greeterService = serviceProvider.get(GreeterService);

  greeterService.greet("TomasJS");
}

main();
        '
        />
      </section>

      <section :id="runningTheAppSectionId" class="mb-5">
        <h4 class="mb-4">Running the app</h4>

        <p>Run your app by running the "dev" command:</p>

        <Code class="mb-4" lang="ps1" code="npm run dev" />

        <p>You should see the following output:</p>

        <Code class="mb-4" lang="ps1" code="Hello, TomasJS!" />
      </section>

      <section :id="buildingTheAppSectionId" class="mb-5">
        <h4 class="mb-4">Building the app</h4>

        <p>Build your app by running the "compile" command:</p>

        <Code class="mb-4" lang="ps1" code="npm run compile" />

        <p>This will generate a build of your app in a ./dist folder.</p>

        <p>To run the built version of the app, run the "start" command:</p>

        <Code class="mb-4" lang="ps1" code="npm run start" />

        <p>You should see the same output, but from the built version of your app.</p>
      </section>

      <section :id="nextStepsSectionId" class="mb-5">
        <p class="fw-bold">Next steps:</p>
        <ul>
          <li>
            <!-- TODO Insert link -->
            <NuxtLink to="#">Learn the fundamentals</NuxtLink>
          </li>
        </ul>
      </section>
    </main>

    <template #sidebarRight>
      <DocsSidebarRight :items="onThisPageItems" />
    </template>
  </NuxtLayout>
</template>
