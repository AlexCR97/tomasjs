import { ClassConstructor, inject } from "@tomasjs/core";
import { repositoryToken } from "@/repositoryToken";

export function injectRepository<TEntity>(entity: ClassConstructor<TEntity>) {
  const token = repositoryToken<TEntity>("mongo", entity);
  return inject(token);
}
