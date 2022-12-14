import { ClassConstructor, inject } from "@/container";
import { RepositoryNameFactory } from "../RepositoryNameFactory";

export function inRepository<TEntity>(entityClass: ClassConstructor<TEntity>) {
  const injectionToken = RepositoryNameFactory.create<TEntity>("mongo", entityClass);
  return inject(injectionToken);
}
