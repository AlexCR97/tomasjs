import { Container, ContainerBuilder, TomasContainer } from "./Container";
import { ContainerSetupFunction } from "./ContainerSetup";
import { TomasServiceProvider } from "./ServiceProvider";
import { Token } from "./Token";

describe("Container", () => {
  it(`Can instantiate a ${ContainerBuilder.name}`, () => {
    const builder = new ContainerBuilder();
    expect(builder).toBeInstanceOf(ContainerBuilder);
  });

  it(`Can build a Container`, async () => {
    const container = await new ContainerBuilder().buildContainer();
    expect(container).toBeInstanceOf(TomasContainer);
  });

  it(`Can build a ServiceProvider`, async () => {
    const services = await new ContainerBuilder().buildServiceProvider();
    expect(services).toBeInstanceOf(TomasServiceProvider);
  });

  it("Can add a ConstructorService", async () => {
    class TestService {}

    const container = await new ContainerBuilder().add("singleton", TestService).buildContainer();

    expect(container.contains(TestService)).toBeTruthy();
  });

  it("Can add a FactoryService with FactoryToken", async () => {
    function testFactory() {
      return `resolved from ${testFactory.name}`;
    }

    const container = await new ContainerBuilder().add("singleton", testFactory).buildContainer();

    expect(container.contains(testFactory)).toBeTruthy();
  });

  it("Can add a factory service with string token", async () => {
    function testFactory() {
      return `resolved from ${testFactory.name}`;
    }

    const testFactoryToken = "myTestFactoryToken";

    const container = await new ContainerBuilder()
      .add("singleton", testFactoryToken, testFactory)
      .buildContainer();

    expect(container.contains(testFactoryToken)).toBeTruthy();
  });

  it("Can add a value service", async () => {
    const testValue = { foo: "bar" } as const;
    const testValueToken: Token<typeof testValue> = "testValue";

    const container = await new ContainerBuilder()
      .add("singleton", testValueToken, testValue)
      .buildContainer();

    expect(container.contains(testValueToken)).toBeTruthy();
  });

  it("Can get count", async () => {
    class TestConstructor {}
    function testFactory() {}
    const testValue = 1;

    const container = await new ContainerBuilder().buildContainer();

    container.add("singleton", TestConstructor);
    expect(container.count).toBe(1);

    container.add("singleton", testFactory);
    expect(container.count).toBe(2);

    container.add("singleton", "1", testValue);
    expect(container.count).toBe(3);
  });

  it("Can clear container", async () => {
    const container = await new ContainerBuilder().buildContainer();

    class TestConstructor {}
    container.add("singleton", TestConstructor);
    expect(container.count).toBe(1);

    function testFactory() {}
    container.add("singleton", testFactory);
    expect(container.count).toBe(2);

    const testValue = 1;
    container.add("singleton", "1", testValue);
    expect(container.count).toBe(3);

    container.clear();
    expect(container.count).toBe(0);
  });

  it("Can remove services", async () => {
    const container = await new ContainerBuilder().buildContainer();

    class TestConstructor {}
    container.add("singleton", TestConstructor);
    container.remove(TestConstructor);
    expect(container.contains(TestConstructor)).toBeFalsy();

    function testFactory() {}
    container.add("singleton", testFactory);
    container.remove(testFactory);
    expect(container.contains(testFactory)).toBeFalsy();

    const testValue = 1;
    const testValueToken: Token<typeof testValue> = "testValue";
    container.add("singleton", testValueToken, testValue);
    container.remove(testValueToken);
    expect(container.contains(testValueToken)).toBeFalsy();

    expect(container.count).toBe(0);
  });

  it("Can build a service provider from a container", async () => {
    const services = await new ContainerBuilder().buildServiceProvider();
    expect(services).toBeInstanceOf(TomasServiceProvider);
  });

  it("Can setup a Container", async () => {
    const setupA: ContainerSetupFunction = (c) => {
      c.add("singleton", "a", "a");
    };

    const setupB: ContainerSetupFunction = (c) => {
      c.add("singleton", "b", "b");
    };

    function setupC(c: Container) {
      c.add("singleton", "c", "c");
    }

    const services = await new ContainerBuilder()
      .use(setupA)
      .use(setupB)
      .use(setupC)
      .use((c) =>
        c
          .add("singleton", "d", "d")
          .add("singleton", "e", "e")
          .add("singleton", "f", "f")
          .add("singleton", "g", "g")
      )
      .buildServiceProvider();

    expect(services.count).toBe(7);

    expect(services.getOrThrow("a")).toBe("a");
    expect(services.getOrThrow("b")).toBe("b");
    expect(services.getOrThrow("c")).toBe("c");
    expect(services.getOrThrow("d")).toBe("d");
    expect(services.getOrThrow("e")).toBe("e");
    expect(services.getOrThrow("f")).toBe("f");
    expect(services.getOrThrow("g")).toBe("g");
  });
});
