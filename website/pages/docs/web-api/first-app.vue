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
      <h3 class="mb-5">Your first TomasJS Web API</h3>

      <section
        :id="exampleSection.id"
        class="mb-5">
        <h4 class="mb-4">{{ exampleSection.label }}</h4>

        <Code
          code='
import "reflect-metadata";
import { JsonResponse } from "@tomasjs/express";
import { ExpressAppBuilder } from "@tomasjs/express/builder";
import { UseControllers, controller, httpGet } from "@tomasjs/express/controllers";

@controller("home")
class HomeController {
  @httpGet()
  get() {
    return new JsonResponse({ message: "Hello, world!" });
  }
}

async function main() {
  await new ExpressAppBuilder({ port: 3030 })
    .use(
      new UseControllers({
        controllers: [HomeController],
      })
    )
    .buildAsync();
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
            <NuxtLink to="/docs/web-api/app-builder">ExpressAppBuilder</NuxtLink>
          </li>
        </ul>
      </section>
    </main>

    <template #sidebarRight>
      <DocsSidebarRight :items="onThisPageItems" />
    </template>
  </NuxtLayout>
</template>
