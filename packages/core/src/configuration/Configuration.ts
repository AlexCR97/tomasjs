export interface Configuration<TObject extends object> {
  get root(): TObject;
}
