<script setup lang="ts"></script>

<template>
  <div>
    <NuxtLayout name="article">
      <template #sidebarLeft>
        <DocsSidebarLeft />
      </template>

      <main class="container py-4">
        <h3 class="mb-5">Your first TomasJS Console app</h3>

        <section id="creatingTheProjectSection" class="mb-5">
          <h4 class="mb-4">Creating the project</h4>

          <p>You can find the starter project template from the following repo:</p>
          <p>
            <a href="https://github.com/AlexCR97/Node-Project-Templates/tree/main/app%20-%20tomasjs"
              >Node-Project-Templates / app - tomasjs</a
            >
          </p>

          <p>
            In a folder of your choice, copy the template "app - tomasjs" with your preferred
            method.
          </p>

          <p>This template has the necessary files to develop a console application.</p>

          <p>Install the dependencies:</p>

          <Code title="powershell / bash" class="mb-4">
            <pre class="m-0 p-0">
npm install
            </pre>
          </Code>
        </section>

        <section id="theGreeterServiceSection" class="mb-5">
          <h4 class="mb-4">The GreeterService</h4>

          <p>Create a GreeterService.ts file:</p>

          <Code title="src/GreeterService.ts" class="mb-4">
            <pre class="m-0 p-0">
import { injectable } from "@tomasjs/core";

@injectable()
export class GreeterService {
  greet(name: string) {
    console.log(`Hello ${name}!`);
  }
}
            </pre>
          </Code>

          <p>Now in your main.ts file, place the following content:</p>

          <Code title="src/main.ts" class="mb-4">
            <pre class="m-0 p-0">
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
            </pre>
          </Code>
        </section>

        <section id="runningTheAppSection" class="mb-5">
          <h4 class="mb-4">Running the app</h4>

          <p>Run your app by running the "dev" command:</p>

          <Code title="powershell / bash" class="mb-4">
            <pre class="m-0 p-0">
npm run dev
            </pre>
          </Code>

          <p>You should see the following output:</p>

          <Code class="mb-4">
            <pre class="m-0 p-0">
Hello, TomasJS!
        </pre
            >
          </Code>
        </section>

        <section id="buildingTheAppSection" class="mb-5">
          <h4 class="mb-4">Building the app</h4>

          <p>Build your app by running the "compile" command:</p>

          <Code title="powershell / bash" class="mb-4">
            <pre class="m-0 p-0">
npm run compile
            </pre>
          </Code>

          <p>This will generate a build of your app in a ./dist folder.</p>

          <p>To run the built version of the app, run the "start" command:</p>

          <Code title="powershell / bash" class="mb-4">
            <pre class="m-0 p-0">
npm run start
            </pre>
          </Code>

          <p>You should see the same output, but from the built version of your app.</p>
        </section>

        <section class="mb-5">
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
        <DocsSidebarRight />
      </template>
    </NuxtLayout>
  </div>
</template>
