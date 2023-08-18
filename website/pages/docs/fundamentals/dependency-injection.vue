<script setup lang="ts">
  import { MenuItem } from "utils";

  const sectionId = "sectionId";
  const nextStepsSectionId = "nextStepsSectionId";

  const onThisPageItems: MenuItem[] = [
    {
      label: "Section Title",
      to: `#${sectionId}`,
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
      <h3 class="mb-5">Dependency Injection</h3>

      <section :id="sectionId" class="mb-5">
        <h4 class="mb-4">Quick Overview</h4>

        <p>
          TomasJS has built-in support for Dependency Injection using
          <a href="https://inversify.io" target="_blank">InversifyJS</a> under the hood.
        </p>

        <p>
          Let's look at an example that creates a CatFoodFactory service and a CatSitter service to
          feed cats.
        </p>

        <p>First, we need to create the CatFood and Cat classes.</p>

        <Code
          code="
class CatFood {
  constructor(readonly description: string) {}
}

class Cat {
  constructor(readonly name: string) {}

  eat(food: CatFood) {
    console.log(`${this.name} is eating ${food.description}. Yummy!`);
  }
}
        "
        />

        <p>Now, let's create the CatFoodFactory service.</p>

        <Code
          code='
@injectable() // This decorator marks your class as a service
class CatFoodFactory {
  createCannedTuna(): CatFood {
    return new CatFood("Canned Tuna");
  }
}
        '
        />

        <p>Next, let's create the CatSitter service.</p>

        <Code
          code="
@injectable()
class CatSitter {
  constructor(
    @inject(CatFoodFactory) // This decorator injects the specified service
    private readonly foodFactory: CatFoodFactory
  ) {}

  feed(cat: Cat) {
    const cannedTuna = this.foodFactory.createCannedTuna();
    cat.eat(cannedTuna);
  }
}
        "
        />

        <p>Finally, wire everything up in the main function:</p>

        <Code
          code='
async function main() {
  const serviceProvider = await new ServiceContainerBuilder()
    .addClass(CatFoodFactory)
    .addClass(CatSitter)
    .buildServiceProviderAsync();

  const tom = new Cat("Tom");
  const pim = new Cat("Pim");

  const catSitter = serviceProvider.get(CatSitter);
  catSitter.feed(tom);
  catSitter.feed(pim);
}
        '
        />

        <p>If you run the application, you should get the following output:</p>

        <Code
          code="
Tom is eating Canned Tuna. Yummy!
Pim is eating Canned Tuna. Yummy!
        "
        />
      </section>

      <section :id="nextStepsSectionId" class="mb-5">
        <p class="fw-bold">Next steps:</p>
        <ul>
          <li>
            <!-- TODO Insert link -->
            <NuxtLink to="#">ContainerSetupFactory</NuxtLink>
          </li>
        </ul>
      </section>
    </main>

    <template #sidebarRight>
      <DocsSidebarRight :items="onThisPageItems" />
    </template>
  </NuxtLayout>
</template>
