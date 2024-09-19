import { IContainer } from "./Container";

/**
 * A setup function used to configure an {@link IContainer}.
 *
 * This type is a union of {@link ContainerSetupFunction} and {@link ContainerSetupFunctionAsync}.
 */
export type ContainerSetup = ContainerSetupFunction | ContainerSetupFunctionAsync;

/**
 * A synchronous setup function used to configure an {@link IContainer}.
 *
 * @param container - The {@link IContainer} instance to configure.
 */
export type ContainerSetupFunction = (container: IContainer) => void;

/**
 * An asynchronous setup function used to configure an {@link IContainer}.
 *
 * @param container - The {@link IContainer} instance to configure.
 * @returns A promise that resolves when the setup operation is complete.
 */
export type ContainerSetupFunctionAsync = (container: IContainer) => Promise<void>;
