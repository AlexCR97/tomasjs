export class FunctionChecker {
  private conditions: boolean[] = [];

  constructor(private readonly obj: unknown | undefined) {}

  private get func(): Function | undefined {
    return this.obj as Function;
  }

  isNotNull(): FunctionChecker {
    this.conditions.push(this.obj !== undefined);
    this.conditions.push(this.obj !== null);
    return this;
  }

  isTypeFunction(): FunctionChecker {
    this.conditions.push(typeof this.obj === "function");
    return this;
  }

  isNotNamed(): FunctionChecker {
    this.conditions.push(
      this.func !== undefined && this.func !== null && this.func.name.trim().length === 0
    );
    return this;
  }

  isNamed(name: string): FunctionChecker {
    this.conditions.push(this.func !== undefined && this.func !== null && this.func.name === name);
    return this;
  }

  isPrototypeUndefined(): FunctionChecker {
    this.conditions.push(Object.getPrototypeOf(this.obj) === undefined);
    return this;
  }

  hasArgumentCount(count: number): FunctionChecker {
    this.conditions.push(
      this.func !== undefined && this.func !== null && this.func.length === count
    );
    return this;
  }

  check(): boolean {
    return this.conditions.every((condition) => condition === true);
  }
}
