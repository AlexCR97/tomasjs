import "reflect-metadata";
import { ContainerBuilder } from "./Container";
import { ServiceFactory } from "./ServiceFactory";
import { Token } from "./Token";
import { inject } from "./@inject";
import { ServiceA } from "./ServiceA_test";
import { ServiceB } from "./ServiceB_test";
import { ServiceNotFoundError } from "./ServiceProvider";

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

  it("Can resolve ConstructorToken dependencies", async () => {
    class ServiceA {}

    class ServiceB {}

    class ServiceC {
      constructor(
        @inject(ServiceA) readonly serviceA: ServiceA,
        @inject(ServiceB) readonly serviceB: ServiceB
      ) {}
    }

    const services = await new ContainerBuilder()
      .add("scoped", ServiceA)
      .add("scoped", ServiceB)
      .add("scoped", ServiceC)
      .buildServiceProvider();

    const serviceC = services.getOrThrow(ServiceC);
    expect(serviceC).toBeInstanceOf(ServiceC);
    expect(serviceC.serviceA).toBeInstanceOf(ServiceA);
    expect(serviceC.serviceB).toBeInstanceOf(ServiceB);
  });

  it("Can resolve ServiceFactoryToken dependencies", async () => {
    class ServiceA {}
    const factoryA: ServiceFactory<ServiceA> = () => {
      return new ServiceA();
    };

    class ServiceB {}
    const factoryB: ServiceFactory<ServiceB> = () => {
      return new ServiceB();
    };

    class ServiceC {
      constructor(
        @inject(factoryA) readonly serviceA: ServiceA,
        @inject(factoryB) readonly serviceB: ServiceB
      ) {}
    }

    const services = await new ContainerBuilder()
      .add("scoped", factoryA)
      .add("scoped", factoryB)
      .add("scoped", ServiceC)
      .buildServiceProvider();

    const serviceC = services.getOrThrow(ServiceC);
    expect(serviceC).toBeInstanceOf(ServiceC);
    expect(serviceC.serviceA).toBeInstanceOf(ServiceA);
    expect(serviceC.serviceB).toBeInstanceOf(ServiceB);
  });

  it("Can resolve ValueToken dependencies", async () => {
    class ServiceA {}
    const serviceAToken = "serviceA";

    class ServiceB {}
    const serviceBToken = "serviceB";

    class ServiceC {
      constructor(
        @inject(serviceAToken) readonly serviceA: ServiceA,
        @inject(serviceBToken) readonly serviceB: ServiceB
      ) {}
    }

    const services = await new ContainerBuilder()
      .add("scoped", serviceAToken, new ServiceA())
      .add("scoped", serviceBToken, new ServiceB())
      .add("scoped", ServiceC)
      .buildServiceProvider();

    const serviceC = services.getOrThrow(ServiceC);
    expect(serviceC).toBeInstanceOf(ServiceC);
    expect(serviceC.serviceA).toBeInstanceOf(ServiceA);
    expect(serviceC.serviceB).toBeInstanceOf(ServiceB);
  });

  it("Can resolve mixed Token dependencies", async () => {
    class ServiceA {}

    class ServiceB {}
    const factoryB: ServiceFactory<ServiceB> = () => {
      return new ServiceB();
    };

    class ServiceC {}
    const serviceCToken = "serviceC";

    class ServiceD {
      constructor(
        @inject(ServiceA) readonly serviceA: ServiceA,
        @inject(factoryB) readonly serviceB: ServiceB,
        @inject(serviceCToken) readonly serviceC: ServiceC
      ) {}
    }

    const services = await new ContainerBuilder()
      .add("scoped", ServiceA)
      .add("scoped", factoryB)
      .add("scoped", serviceCToken, new ServiceC())
      .add("scoped", ServiceD)
      .buildServiceProvider();

    const serviceD = services.getOrThrow(ServiceD);
    expect(serviceD).toBeInstanceOf(ServiceD);
    expect(serviceD.serviceA).toBeInstanceOf(ServiceA);
    expect(serviceD.serviceB).toBeInstanceOf(ServiceB);
    expect(serviceD.serviceC).toBeInstanceOf(ServiceC);
  });

  it("Cannot resolve circular dependencies", async () => {
    const services = await new ContainerBuilder()
      .add("scoped", ServiceA)
      .add("scoped", ServiceB)
      .buildServiceProvider();

    try {
      const serviceA = services.getOrThrow(ServiceA);
      console.log("serviceA", serviceA);
    } catch (err) {
      expect(err).toBeInstanceOf(ServiceNotFoundError);
    }
  });

  it("Can resolve complex levels of dependencies", async () => {
    class FindUserPreferencesQuery {}

    class QueryDispatcher {
      constructor(
        @inject(FindUserPreferencesQuery) readonly findUserPrefsQuery: FindUserPreferencesQuery
      ) {}
    }

    class UserService {
      constructor(@inject(QueryDispatcher) readonly queryDispatcher: QueryDispatcher) {}
    }

    class GetUserQuery {
      constructor(@inject(QueryDispatcher) readonly queryDispatcher: QueryDispatcher) {}
    }

    const services = await new ContainerBuilder()
      .add("scoped", FindUserPreferencesQuery)
      .add("singleton", QueryDispatcher)
      .add("scoped", UserService)
      .add("scoped", GetUserQuery)
      .buildServiceProvider();

    const findUserPrefsQuery = services.getOrThrow(FindUserPreferencesQuery);
    expect(findUserPrefsQuery).toBeInstanceOf(FindUserPreferencesQuery);

    const queryDispatcher = services.getOrThrow(QueryDispatcher);
    expect(queryDispatcher).toBeInstanceOf(QueryDispatcher);
    expect(queryDispatcher.findUserPrefsQuery).toBeInstanceOf(FindUserPreferencesQuery);

    const userService = services.getOrThrow(UserService);
    expect(userService).toBeInstanceOf(UserService);
    expect(userService.queryDispatcher).toBeInstanceOf(QueryDispatcher);
    expect(userService.queryDispatcher).toBe(queryDispatcher);

    const getUserQuery = services.getOrThrow(GetUserQuery);
    expect(getUserQuery).toBeInstanceOf(GetUserQuery);
    expect(getUserQuery.queryDispatcher).toBeInstanceOf(QueryDispatcher);
    expect(getUserQuery.queryDispatcher).toBe(queryDispatcher);
  });

  it("Can resolve dependencies of a class the inherits an abstract class", async () => {
    class DbAccess {}

    abstract class BaseRepository {
      constructor(readonly dbAccess: DbAccess) {}
    }

    class UserRepository extends BaseRepository {
      constructor(@inject(DbAccess) readonly dbAccess: DbAccess) {
        super(dbAccess);
      }
    }

    const services = await new ContainerBuilder()
      .add("scoped", DbAccess)
      .add("scoped", UserRepository)
      .buildServiceProvider();

    const userRepository = services.getOrThrow(UserRepository);
    expect(userRepository).toBeInstanceOf(UserRepository);
    expect(userRepository.dbAccess).toBeInstanceOf(DbAccess);
  });
});
