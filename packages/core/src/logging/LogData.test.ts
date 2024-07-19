import "reflect-metadata";
import { LogDataValue } from "./LogData";

describe("LogData", () => {
  it("can create of each type", () => {
    const booleanFalseData = LogDataValue.from(false);
    expect(booleanFalseData.value).toBe(false);
    expect(booleanFalseData.toString()).toMatch("false");

    const booleanTrueData = LogDataValue.from(true);
    expect(booleanTrueData.value).toBe(true);
    expect(booleanTrueData.toString()).toMatch("true");

    const number0Data = LogDataValue.from(0);
    expect(number0Data.value).toBe(0);
    expect(number0Data.toString()).toMatch("0");

    const number99Data = LogDataValue.from(99);
    expect(number99Data.value).toBe(99);
    expect(number99Data.toString()).toMatch("99");

    const numberNegativeData = LogDataValue.from(-1);
    expect(numberNegativeData.value).toBe(-1);
    expect(numberNegativeData.toString()).toMatch("-1");

    const stringData = LogDataValue.from("foo");
    expect(stringData.value).toBe("foo");
    expect(stringData.toString()).toMatch("foo");

    const objectData = LogDataValue.from({ fizz: "buzz" });
    expect(objectData.value).toMatchObject({ fizz: "buzz" });
    expect(objectData.toString()).toMatch(JSON.stringify({ fizz: "buzz" }));
  });
});
