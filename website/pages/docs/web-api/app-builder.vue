<script setup lang="ts">
import { MenuItem } from "utils";

const optionsSection: MenuItem = {
  id: "optionsSection",
  to: `#optionsSection`,
  label: "Options",
};

const useJsonSection: MenuItem = {
  id: "useJsonSection",
  to: `#useJsonSection`,
  label: "Use JSON",
};

const appSetupFunctionSection: MenuItem = {
  id: "appSetupFunctionSection",
  to: `#appSetupFunctionSection`,
  label: "AppSetupFunction",
};

const appSetupFactorySection: MenuItem = {
  id: "appSetupFactorySection",
  to: `#appSetupFactorySection`,
  label: "AppSetupFactory",
};

const nextStepsSection: MenuItem = {
  id: "nextSteps",
  to: "#nextSteps",
  label: "Next Steps",
};

const onThisPageItems: MenuItem[] = [
  optionsSection,
  useJsonSection,
  appSetupFunctionSection,
  appSetupFactorySection,
  nextStepsSection,
];
</script>

<template>
  <NuxtLayout name="article">
    <template #sidebarLeft>
      <DocsSidebarLeft />
    </template>

    <main class="container py-4">
      <h3 class="mb-5">AppBuilder</h3>

      <section
        :id="optionsSection.id"
        class="mb-5">
        <h4 class="mb-4">{{ optionsSection.label }}</h4>

        <Code
          code="
await new AppBuilder({
  // The underlying express app that will be used by TomasJS.
  // If undefined, TomasJS will build the app itself.
  app: undefined,

  // Your DI container, which you will typically build beforehand.
  // If any of your http components (Controllers, Middlewares, etc.)
  // use DI services, you'll want to pass in the container.
  container: undefined,

  // A logger that you can use to debug the bootstrapping process.
  logger: new TomasLogger(AppBuilder.name, 'debug'),

  // The port where your app will listen for requests.
  // The default is 3000.
  port: 3030,
})
  // Remember to build you app by calling the 'buildAsync' method.
  // This will start the server.
  .buildAsync();
          " />
      </section>

      <section
        :id="useJsonSection.id"
        class="mb-5">
        <h4 class="mb-4">{{ useJsonSection.label }}</h4>

        <Code
          code="
await new AppBuilder()
  .use(new UseJson({
    // json options
  }))
  .buildAsync();
          " />
      </section>

      <section
        :id="appSetupFunctionSection.id"
        class="mb-5">
        <h4 class="mb-4">{{ appSetupFunctionSection.label }}</h4>

        <Code
          code="
const myAppSetup: AppSetupFunction = (app, container) => {
  // Use 'app' to configure the underlying express application
  // Use 'container' to configure the underlying DI container
};

await new AppBuilder()
  .use(myAppSetup)
  .buildAsync();
          " />
      </section>

      <section
        :id="appSetupFactorySection.id"
        class="mb-5">
        <h4 class="mb-4">{{ appSetupFactorySection.label }}</h4>

        <Code
          code="
class MyAppSetup implements AppSetupFactory {
  create(): AppSetupFunction {
    return (app, container) => {
      // Use 'app' to configure the underlying express application
      // Use 'container' to configure the underlying DI container
    };
  }
}

await new AppBuilder()
  .use(new MyAppSetup())
  .buildAsync();
          " />
      </section>

      <section
        :id="nextStepsSection.id"
        class="mb-5">
        <p class="fw-bold">{{ nextStepsSection.label }}</p>
        <ul>
          <li>
            <NuxtLink to="/docs/web-api/controllers">Controllers</NuxtLink>
          </li>
        </ul>
      </section>
    </main>

    <template #sidebarRight>
      <DocsSidebarRight :items="onThisPageItems" />
    </template>
  </NuxtLayout>
</template>
