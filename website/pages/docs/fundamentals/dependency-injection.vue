<script setup lang="ts">
  import { MenuItem } from "utils";

  const quickOverviewSection: MenuItem = {
    id: "quickOverviewSection",
    to: `#quickOverviewSection`,
    label: "Quick Overview",
  };

  const serviceContainerBuilderSection: MenuItem = {
    id: "serviceContainerBuilder",
    to: "#serviceContainerBuilder",
    label: "The ServiceContainerBuilder class",
  };

  const containerSetupFactorySection: MenuItem = {
    id: "containerSetupFactorySection",
    to: "#containerSetupFactorySection",
    label: "The ContainerSetupFactory class",
  };

  const nextStepsSection: MenuItem = {
    id: "nextSteps",
    to: "#nextSteps",
    label: "Next Steps",
  };

  const onThisPageItems: MenuItem[] = [
    quickOverviewSection,
    serviceContainerBuilderSection,
    containerSetupFactorySection,
    nextStepsSection,
  ];
</script>

<template>
  <NuxtLayout name="article">
    <template #sidebarLeft>
      <DocsSidebarLeft />
    </template>

    <main class="container py-4">
      <h3 class="mb-5">Dependency Injection</h3>

      <section :id="quickOverviewSection.id" class="mb-5">
        <h4 class="mb-4">{{ quickOverviewSection.label }}</h4>

        <p>TomasJS has built-in support for Dependency Injection (or DI for short).</p>

        <p>
          For DI to work, TomasJS internally uses
          <a href="https://inversify.io" target="_blank">InversifyJS</a> and
          <a href="https://rbuckton.github.io/reflect-metadata" target="_blank">reflect-metadata</a>
          .
        </p>

        <Alert> You should always import only once reflect-metadata in your main file. </Alert>

        <p>
          Let's look at an example that uses a CatFoodFactory to create cat food and a CatSitter
          service to feed cats.
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
@injectable() // This decorator marks your class as a service
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

        <p>Here's the complete code:</p>

        <Code
          code='
import "reflect-metadata";
import { ServiceContainerBuilder, inject, injectable } from "@tomasjs/core";

class CatFood {
  constructor(readonly description: string) {}
}

class Cat {
  constructor(readonly name: string) {}

  eat(food: CatFood) {
    console.log(`${this.name} is eating ${food.description}. Yummy!`);
  }
}

@injectable()
class CatFoodFactory {
  createCannedTuna(): CatFood {
    return new CatFood("Canned Tuna");
  }
}

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

main();
        '
        />

        <p>
          Now that you've seen how DI fundamentally works in TomasJS, let's take a deep dive into
          the details.
        </p>
      </section>

      <section :id="serviceContainerBuilderSection.id" class="mb-5">
        <h4 class="mb-4">{{ serviceContainerBuilderSection.label }}</h4>

        <p>
          The ServiceContainerBuilder class is that you'll be using to initialize the DI container.
        </p>

        <p>To create a ServiceContainerBuilder, simply instantiate the class:</p>

        <Code code="const services = new ServiceContainerBuilder();" />

        <p>To add services to the container you'll be able to use these methods:</p>
        <ul>
          <li>addClass</li>
          <li>addInstance</li>
          <li>setup</li>
        </ul>

        <p>Let's look at each one</p>

        <section class="mb-4">
          <p class="fw-bold">addClass</p>

          <p>
            The addClass method lets you register a class into the DI container. It takes one
            mandatory argument and a second optional argument.
          </p>

          <p>The first argument is the constructor of the class you want to register:</p>

          <Code code="services.addClass(MyClass);" />

          <p>
            By default, the service is registered with the transient scope. If you want to specify
            another scope, you can pass an options argument as the second parameter.
          </p>

          <p>
            For now, TomasJS only supports the scopes transient, singleton and request. More
            information about these scopes can be found at
            <a
              href="https://github.com/inversify/InversifyJS/blob/master/wiki/scope.md"
              target="_blank"
            >
              InversifyJS scopes
            </a>
            .
          </p>

          <Code code='services.addClass(MyClass, { scope: "transient" });' />

          <p>
            When adding a service to the DI container, each service must be identified by a unique
            token (an id, essentially). When using the addClass method, the service gets registered
            with the class's constructor name by default.
          </p>

          <p>
            In our example, since the constructor name is MyClass, the service is registered with
            the "MyClass" token, so when we want to inject our service, we would do it in the
            following way:
          </p>

          <Code code="constructor(@inject(MyClass) myClass: MyClass) {}" />

          <p>
            Notice how we are using the @inject decorator and passing the MyClass constructor as an
            argument. This is telling TomasJS to inject the service after the "MyClass" token.
          </p>

          <p>
            But sometimes we want to use a different token to register our service. To do this we
            can pass a token property into the options argument:
          </p>

          <Code code='services.addClass(MyClass, { token: "MyCustomToken" });' />

          <p>So when we inject our service, it would look like this:</p>

          <Code code='constructor(@inject("MyCustomToken") myClass: MyClass) {}' />
        </section>

        <section class="mb-4">
          <p class="fw-bold">addInstance</p>

          <p>The addInstance method lets you register a constant value into the DI container.</p>

          <p>Suppose we have the following class:</p>

          <Code
            code="
@injectable()
class Prefixer {
  constructor(private readonly prefix: string) {}

  prefixWord(word: string) {
    return `${this.prefix}${word}`;
  }
}
          "
          />

          <p>And we create multiple instances of that class:</p>

          <Code
            code='
const fooPrefixer = new Prefixer("foo");
const barPrefixer = new Prefixer("bar");
          '
          />

          <p>We can use the addInstance method to register each of those instances:</p>

          <Code
            code='
services.addInstance(fooPrefixer, "FooPrefixer");
services.addInstance(barPrefixer, "BarPrefixer");
          '
          />

          <p>Now we can inject those instances in the following way:</p>

          <Code
            code='
constructor(
  @inject("FooPrefixer") fooPrefixer: Prefixer,
  @inject("BarPrefixer") barPrefixer: Prefixer
) {}
          '
          />

          <p>
            This works for any data type too. So you can do things like registering and injecting
            numbers, strings and arrays.
          </p>
        </section>

        <section class="mb-4">
          <p class="fw-bold">setup</p>

          <p>
            The setup method lets you use the underlying DI container to do some more advance
            registrations.
          </p>

          <p>
            It takes only one argument, which is either a ContainerSetupFunction or a
            ContainerSetupFactory. We'll look at these fancy terms into more detail later.
          </p>

          <p>
            For now, just know that the ContainerSetupFunction is a callback that exposes a
            Container as it's first parameter.
          </p>

          <p>You can use this Container to do all sorts of stuff. It has the following methods:</p>

          <Code
            code='
services.setup((c) => {
  // Use "c" to manipulate the underlying container
  c.addClass(/*args*/);
  c.addInstance(/*args*/);
  c.get(/*args*/);
  c.getAll(/*args*/);
  c.getOrDefault(/*args*/);
  c.has(/*args*/);
  c.remove(/*args*/);
});
          '
          />

          <p>Each method does what it's name implies.</p>

          <p>
            But why would we want to use the underlying container if we already have the
            ServiceContainerBuilder? Well, this allows TomasJS to be flexible, extensible and
            maintainable. You can achieve things like:
          </p>
          <ul>
            <li>Modularize your DI container</li>
            <li>Manage your DI container in separate files</li>
            <li>Develop plugins and libraries that extend TomasJS's capabilities</li>
            <li>etc.</li>
          </ul>

          <p>Here's an example of how to modularize your DI container:</p>

          <Code
            code='
import "reflect-metadata";
import { ContainerSetupFunction, ServiceContainerBuilder, injectable } from "@tomasjs/core";

@injectable()
class SomeClassA {}

@injectable()
class SomeClassB {}

const myModuleA: ContainerSetupFunction = (container) => {
  container.addClass(SomeClassA);
};

const myModuleB: ContainerSetupFunction = (container) => {
  container.addClass(SomeClassB);
};

async function main() {
  const services = await new ServiceContainerBuilder()
    .setup(myModuleA)
    .setup(myModuleB)
    .buildServiceProviderAsync();

  const instanceA = services.get(SomeClassA);
  const instanceB = services.get(SomeClassB);

  console.log("instanceA", instanceA);
  console.log("instanceB", instanceB);
}

main();
          '
          />
        </section>
      </section>

      <section :id="containerSetupFactorySection.id" class="mb-5">
        <h4 class="mb-4">{{ containerSetupFactorySection.label }}</h4>

        <p>TODO</p>
      </section>

      <section :id="nextStepsSection.id" class="mb-5">
        <p class="fw-bold">{{ nextStepsSection.label }}</p>
        <ul>
          <li>
            <!-- TODO Insert link -->
            <NuxtLink to="#">CQRS</NuxtLink>
          </li>
        </ul>
      </section>
    </main>

    <template #sidebarRight>
      <DocsSidebarRight :items="onThisPageItems" />
    </template>
  </NuxtLayout>
</template>
