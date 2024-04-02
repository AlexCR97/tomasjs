import { Guid, InvalidGuidError } from "./Guid";

describe("Guid", () => {
  describe("new()", () => {
    it("should generate a valid Guid", () => {
      const guid = Guid.new();
      expect(guid).toBeInstanceOf(Guid);
    });
  });

  describe("from()", () => {
    it("should return null for an invalid Guid", () => {
      const invalidGuid = "invalid-guid";
      expect(Guid.from(invalidGuid)).toBeNull();
    });

    it("should return a Guid instance for a valid Guid", () => {
      const validGuid = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee";
      const guid = Guid.from(validGuid);
      expect(guid).toBeInstanceOf(Guid);
      expect(guid!.toString()).toBe(validGuid);
    });
  });

  describe("fromOrThrow()", () => {
    it("should throw an InvalidGuidError for an invalid Guid", () => {
      const invalidGuid = "invalid-guid";
      expect(() => Guid.fromOrThrow(invalidGuid)).toThrow(InvalidGuidError);
    });

    it("should return a Guid instance for a valid Guid", () => {
      const validGuid = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee";
      const guid = Guid.fromOrThrow(validGuid);
      expect(guid).toBeInstanceOf(Guid);
      expect(guid.toString()).toBe(validGuid);
    });
  });

  describe("isValid()", () => {
    it("should return true for a valid Guid", () => {
      const validGuid = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee";
      expect(Guid.isValid(validGuid)).toBe(true);
    });

    it("should return false for an invalid Guid", () => {
      const invalidGuid = "invalid-guid";
      expect(Guid.isValid(invalidGuid)).toBe(false);
    });
  });

  describe("equals()", () => {
    it("should return true when comparing equal Guid instances", () => {
      const guid1 = Guid.fromOrThrow("aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee");
      const guid2 = Guid.fromOrThrow("aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee");
      expect(guid1.equals(guid2)).toBe(true);
    });

    it("should return false when comparing different Guid instances", () => {
      const guid1 = Guid.fromOrThrow("aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee");
      const guid2 = Guid.fromOrThrow("11111111-bbbb-cccc-dddd-eeeeeeeeeeee");
      expect(guid1.equals(guid2)).toBe(false);
    });
  });
});
