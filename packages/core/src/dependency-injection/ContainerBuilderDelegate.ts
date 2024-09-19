import { IContainerBuilder } from "./Container";

/**
 * A delegate function used to configure an {@link IContainerBuilder}.
 *
 * This function allows for the setup of services, registrations, or other configurations on the container builder.
 *
 * @param builder - The {@link IContainerBuilder} instance to configure.
 */
export type ContainerBuilderDelegate = (builder: IContainerBuilder) => void;
