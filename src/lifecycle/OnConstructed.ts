/**
 * The component has been created by the dependency container.
 *
 * This interface will be invoked a specific amount of times depending
 * on the scope of the component. E.g., a singleton component will only
 * invoke this interface once, whereas a transient component will invoke
 * this interface more than once.
 */
export interface OnConstructed {
  onConstructed(): void | Promise<void>;
}
