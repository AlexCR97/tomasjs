import {
  HtmlContent,
  IHttpContent,
  JsonContent,
  JsonContentError,
  PlainTextContent,
  RawContent,
} from "./HttpContent";

describe("http/HttpContent", () => {
  it("can parse raw plain text content", () => {
    const expectedData = Buffer.from("raw content");
    const expectedText = "raw content";
    const expectedString = "raw content";

    const content: IHttpContent<unknown> = new RawContent("text/plain", Buffer.from("raw content"));

    expect(content.readData()).toMatchObject(expectedData);
    expect(() => content.readJson()).toThrow(JsonContentError);
    expect(content.readText()).toMatch(expectedText);
    expect(content.toString()).toMatch(expectedString);
  });

  it("can parse raw json content", () => {
    const expectedData = Buffer.from('{ "foo": "bar" }');
    const expectedJson = { foo: "bar" };
    const expectedText = '{ "foo": "bar" }';
    const expectedString = '{ "foo": "bar" }';

    const content: IHttpContent<unknown> = new RawContent(
      "application/json",
      Buffer.from('{ "foo": "bar" }')
    );

    expect(content.readData()).toMatchObject(expectedData);
    expect(content.readJson()).toMatchObject(expectedJson);
    expect(content.readText()).toMatch(expectedText);
    expect(content.toString()).toMatch(expectedString);
  });

  it("can parse plain text", () => {
    const expectedData = "Hello World!";
    const expectedText = "Hello World!";
    const expectedString = "Hello World!";

    const content: IHttpContent<unknown> = PlainTextContent.from("Hello World!");

    expect(content.readData()).toMatch(expectedData);
    expect(() => content.readJson()).toThrow(JsonContentError);
    expect(content.readText()).toMatch(expectedText);
    expect(content.toString()).toMatch(expectedString);
  });

  it("can parse plain text json", () => {
    const expectedData = '{ "foo": "bar" }';
    const expectedJson = { foo: "bar" };
    const expectedText = '{ "foo": "bar" }';
    const expectedString = '{ "foo": "bar" }';

    const content: IHttpContent<unknown> = PlainTextContent.from('{ "foo": "bar" }');

    expect(content.readData()).toMatch(expectedData);
    expect(content.readJson()).toMatchObject(expectedJson);
    expect(content.readText()).toMatch(expectedText);
    expect(content.toString()).toMatch(expectedString);
  });

  it("can parse html", () => {
    const expectedData = /*html*/ `<h1>Hello World!</h1>`;
    const expectedText = /*html*/ `<h1>Hello World!</h1>`;
    const expectedString = /*html*/ `<h1>Hello World!</h1>`;

    const content: IHttpContent<unknown> = HtmlContent.from(/*html*/ `<h1>Hello World!</h1>`);

    expect(content.readData()).toMatch(expectedData);
    expect(() => content.readJson()).toThrow(JsonContentError);
    expect(content.readText()).toMatch(expectedText);
    expect(content.toString()).toMatch(expectedString);
  });

  it("can parse json", () => {
    const expectedData = { foo: "bar" };
    const expectedJson = { foo: "bar" };
    const expectedText = JSON.stringify({ foo: "bar" }, undefined, 2);
    const expectedString = JSON.stringify({ foo: "bar" }, undefined, 2);

    const content: IHttpContent<unknown> = JsonContent.from({ foo: "bar" });

    expect(content.readData()).toMatchObject(expectedData);
    expect(content.readJson()).toMatchObject(expectedJson);
    expect(content.readText()).toMatch(expectedText);
    expect(content.toString()).toMatch(expectedString);
  });
});
