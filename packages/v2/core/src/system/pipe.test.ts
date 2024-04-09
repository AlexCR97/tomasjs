import { pipe } from "./pipe";

describe("pipe", () => {
  it("should create a pipeline with an initial value", () => {
    const initialValue = 5;
    const p = pipe(initialValue);
    expect(p.get()).toEqual(initialValue);
  });

  it("should apply a transformation to the pipeline", () => {
    const initialValue = 5;
    const double = (x: number) => x * 2;
    const p = pipe(initialValue).pipe(double);
    expect(p.get()).toEqual(10);
  });

  it("should chain multiple transformations", () => {
    const initialValue = 5;
    const double = (x: number) => x * 2;
    const increment = (x: number) => x + 3;
    const p = pipe(initialValue).pipe(double).pipe(increment);
    expect(p.get()).toEqual(13);
  });

  it("should handle transformations with different types", () => {
    const initialValue = 5;
    const toString = (x: number) => x.toString();
    const p = pipe(initialValue).pipe(toString);
    expect(p.get()).toEqual("5");
  });
});
