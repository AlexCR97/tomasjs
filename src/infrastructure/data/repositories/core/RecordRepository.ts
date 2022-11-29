import { IGetRequest, IMongoRepository } from "@/core/data/mongo";
import { PagedResult, PagedResultBuilder } from "@/core/data/responses";
import { RecordEntity } from "@/core/entities/base";
import { EntityName } from "@mikro-orm/core";
import { MongoDb } from "../../mongo";

export abstract class RecordRepository<TEntity extends RecordEntity>
  implements IMongoRepository<TEntity>
{
  protected abstract readonly entityName: EntityName<TEntity>;

  constructor(private readonly mongo: MongoDb) {}

  async getAsync(request?: IGetRequest | undefined): Promise<PagedResult<TEntity>> {
    // TODO Use request
    return new PagedResultBuilder<TEntity>()
      .setData(await this.repository.findAll())
      .setTotalCount(await this.repository.count())
      .build();
  }

  async getByIdAsync(id: string): Promise<TEntity> {
    return await this.repository.findOneOrFail({ id } as any); // TODO Figure out if "as any" is an issue
  }

  async createAsync(document: TEntity): Promise<string> {
    const id = await this.repository.nativeInsert(document);
    return id.toString();
  }

  async updateAsync(id: string, document: TEntity): Promise<void> {
    await this.repository.nativeUpdate({ id } as any, document); // TODO Figure out if "as any" is an issue
  }

  async deleteAsync(id: string): Promise<void> {
    await this.repository.nativeDelete({ id } as any); // TODO Figure out if "as any" is an issue
  }

  // TODO Add return type
  protected get repository() {
    return this.mongo.em.getRepository(this.entityName);
  }
}
