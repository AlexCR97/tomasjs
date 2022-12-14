import { inject } from "tsyringe";
import { constructor } from "tsyringe/dist/typings/types";
import { RepositoryNameFactory } from "../RepositoryNameFactory";

export function inRepository<TEntity>(entityClass: constructor<TEntity>) {
  const injectionToken = RepositoryNameFactory.create<TEntity>("mongo", entityClass);
  return inject(injectionToken);
}
