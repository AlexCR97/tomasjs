/**
 * The component has been resolved from the application's dependency container.
 */
export interface OnResolved {
  onResolved(): void | Promise<void>;
}
