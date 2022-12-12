import { DependencyContainer } from "tsyringe";

export type AsyncContainerSetup = (container: DependencyContainer) => Promise<void>;

export function isAsyncContainerSetup(obj: any): obj is AsyncContainerSetup {
  if (typeof obj !== "function") {
    return false;
  }

  const func = obj as Function;

  // Considering that a DeferredContainerSetup must be an async function...
  return (
    func.prototype === undefined && // The prototype must be undefined
    func.length === 1 && // It must receive 1 argument
    func.toString().includes("=>") // It must be an arrow function
  );
}
