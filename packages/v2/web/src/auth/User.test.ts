import { Claims } from "./Claims";
import { IUser, IUserReader, User, UserReader } from "./User";

describe("User", () => {
  const plainClaims = {
    foo: "bar",
    fizz: "buzz",
  } as const;

  const claims = new Claims(plainClaims);

  let user: IUser;
  let userReader: IUserReader;

  beforeEach(() => {
    user = new User();
    userReader = new UserReader(user);
  });

  it("should authenticate", () => {
    const result = user.authenticate();
    expect(result).toBe(true);
    expect(user.authenticated).toBe(true);
    expect(user.claims.keys.length).toBe(0);
  });

  it("should authenticate with claims", () => {
    const result = user.authenticate(claims);
    expect(result).toBe(true);
    expect(user.authenticated).toBe(true);
    expect(user.claims).toBe(claims);
    expect(user.claims.get("foo")).toBe(plainClaims.foo);
    expect(user.claims.get("fizz")).toBe(plainClaims.fizz);
  });
});
