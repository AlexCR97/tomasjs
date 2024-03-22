import { Container } from "./Container";

describe("Container", () => {
  it("Can instantiate an object", () => {
    const container = new Container();
    expect(container).toBeInstanceOf(Container);
  });
});
