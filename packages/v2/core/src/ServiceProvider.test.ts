import { ContainerBuilder } from "./Container";
import { ServiceFactory } from "./ServiceFactory";
import { Token } from "./Token";

describe("ServiceProvider", () => {
  it("Can get value service", async () => {
    const myValue = { foo: "bar" } as const;
    const myToken: Token<typeof myValue> = "myToken";
    const services = await new ContainerBuilder()
      .add("singleton", myToken, myValue)
      .buildServiceProvider();
    const myResolvedValue = services.get<typeof myValue>(myToken);
    expect(myResolvedValue).toBe(myValue);
  });

  it("Can get a factory service", async () => {
    const myValue = { foo: "bar" } as const;
    type MyType = typeof myValue;
    const myFactory: ServiceFactory<MyType> = () => myValue;

    const services = await new ContainerBuilder()
      .add("singleton", myFactory)
      .buildServiceProvider();

    const myResolvedValue = services.get(myFactory);

    expect(myResolvedValue).toBe(myValue);
  });

  it("Can get a constructor service", async () => {
    class TestService {
      foo() {
        return "bar";
      }
    }

    const services = await new ContainerBuilder()
      .add("singleton", TestService)
      .buildServiceProvider();

    const myResolvedService = services.getOrThrow(TestService);

    expect(myResolvedService).toBeInstanceOf(TestService);
    expect(myResolvedService.foo()).toMatch("bar");
  });

  it("Can resolve a scoped service", async () => {
    class Counter {
      private _count = 0;

      get count(): number {
        return this._count;
      }

      increment() {
        this._count += 1;
      }
    }

    const services = await new ContainerBuilder().add("scoped", Counter).buildServiceProvider();

    const counterA = services.getOrThrow(Counter);
    counterA.increment();
    counterA.increment();
    counterA.increment();
    expect(counterA.count).toBe(3);

    const counterB = services.getOrThrow(Counter);
    counterB.increment();
    counterB.increment();
    counterB.increment();
    counterB.increment();
    counterB.increment();
    expect(counterB.count).toBe(5);

    expect(counterB).not.toBe(counterA);
  });

  it("Can resolve a singleton service", async () => {
    class Counter {
      private _count = 0;

      get count(): number {
        return this._count;
      }

      increment() {
        this._count += 1;
      }
    }

    const services = await new ContainerBuilder().add("singleton", Counter).buildServiceProvider();

    const counterA = services.getOrThrow(Counter);
    counterA.increment();
    counterA.increment();
    counterA.increment();
    expect(counterA.count).toBe(3);

    const counterB = services.getOrThrow(Counter);
    counterB.increment();
    counterB.increment();
    counterB.increment();
    counterB.increment();
    counterB.increment();
    expect(counterB.count).toBe(8);

    expect(counterB).toBe(counterA);
  });
});
