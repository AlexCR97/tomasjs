/**
 * The component has been binded into the application's HTTP pipeline.
 */
export interface OnBinded {
  onBinded(): void | Promise<void>;
}
