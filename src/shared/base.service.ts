import {
  AnyEntity,
  EntityData,
  FilterQuery,
  FindOneOptions,
  FindOneOrFailOptions,
  FindOptions,
  Loaded,
  New,
  Populate,
  QueryOrderMap,
} from '@mikro-orm/core';
import { EntityRepository } from '@mikro-orm/postgresql';
import {
  Injectable,
  NotFoundException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { EntityData, FilterQuery } from '@mikro-orm/core/typings';

@Injectable()
export abstract class BaseService<T> {
  protected logger: Logger;
  constructor(private readonly genericRepository: EntityRepository<T>) {}

  private catchError(err: Error): void {
    this.logger.error(err);
    throw new BadRequestException(err);
  }

  findAll<P extends Populate<T> = any>(
    options?: FindOptions<T, P>
  ): Promise<Loaded<T, P>[]>;
  findAll<P extends Populate<T> = any>(
    populate?: P,
    orderBy?: QueryOrderMap,
    limit?: number,
    offset?: number
  ): Promise<Loaded<T, P>[]>;
  async findAll(...args) {
    return this.genericRepository.findAll(...args).catch(this.catchError);
  }

  find<P extends Populate<T> = any>(
    where: FilterQuery<T>,
    options?: FindOptions<T, P>
  ): Promise<Loaded<T, P>[]>;
  find<P extends Populate<T> = any>(
    where: FilterQuery<T>,
    populate?: P,
    orderBy?: QueryOrderMap,
    limit?: number,
    offset?: number
  ): Promise<Loaded<T, P>[]>;
  async find<P extends Populate<T> = any>(
    arg1: FilterQuery<T>,
    arg2: FindOptions<T, P> | P,
    arg3?: QueryOrderMap,
    arg4?: number,
    arg5?: number
  ) {
    return this.genericRepository
      .find(arg1, arg2, arg3, arg4, arg5)
      .catch(this.catchError);
  }

  findOne<P extends Populate<T> = any>(
    where: FilterQuery<T>,
    populate?: P,
    orderBy?: QueryOrderMap
  ): Promise<Loaded<T, P> | null>;
  findOne<P extends Populate<T> = any>(
    where: FilterQuery<T>,
    populate?: FindOneOptions<T, P>,
    orderBy?: QueryOrderMap
  ): Promise<Loaded<T, P> | null>;
  async findOne<P extends Populate<T> = any>(
    arg1: FilterQuery<T>,
    arg2?: P | FindOptions<T, P>,
    arg3?: QueryOrderMap
  ) {
    return this.genericRepository
      .findOne(arg1, arg2, arg3)
      .catch(this.catchError);
  }

  findOneOrFail<P extends Populate<T> = any>(
    where: FilterQuery<T>,
    populate?: P,
    orderBy?: QueryOrderMap
  ): Promise<Loaded<T, P>>;
  findOneOrFail<P extends Populate<T> = any>(
    where: FilterQuery<T>,
    populate?: FindOneOrFailOptions<T, P>,
    orderBy?: QueryOrderMap
  ): Promise<Loaded<T, P>>;
  async findOneOrFail<P extends Populate<T> = any>(
    arg1: FilterQuery<T>,
    arg2?: P | FindOneOrFailOptions<T, P>,
    arg3?: QueryOrderMap
  ) {
    return this.genericRepository
      .findOneOrFail(arg1, arg2, arg3)
      .catch(this.catchError);
  }

  create<P extends Populate<T> = string[]>(data: EntityData<T>): New<T, P> {
    try {
      return this.genericRepository.create(data);
    } catch (err) {
      this.catchError(err);
    }
  }

  async update(
    oldPartialEntity: Partial<T>,
    newPartialEntity: Partial<T>
  ): Promise<T> {
    try {
      const foundEntity = await this.findOne(oldPartialEntity);
      if (!foundEntity) {
        throw new NotFoundException();
      }
      const mergedEntity = Object.assign<T, Partial<T>>(
        foundEntity,
        newPartialEntity
      );
      await this.genericRepository.persistAndFlush(mergedEntity);
      return mergedEntity;
    } catch (err) {
      this.catchError(err);
    }
  }

  async persistAndFlush(entity: AnyEntity | AnyEntity[]) {
    return this.genericRepository
      .persistAndFlush(entity)
      .catch(this.catchError);
  }

  async save(entity: T): Promise<T> {
    try {
      const mergedEntity = this.genericRepository.create(entity);
      await this.genericRepository.persistAndFlush(mergedEntity);
      return entity;
    } catch (err) {
      this.catchError(err);
    }
  }

  async delete(entity: AnyEntity | AnyEntity[]): Promise<void> {
    try {
      this.genericRepository.remove(entity);
      return await this.genericRepository.flush();
    } catch (err) {
      this.catchError(err);
    }
  }

  public async upsert({
    data,
    where,
    flush = false,
  }: {
    data: EntityData<T>;
    where: FilterQuery<T>;
    flush?: boolean;
  }) {
    try {
      let entity = await this.genericRepository.findOne(where);
      if (entity) {
        this.genericRepository.assign(entity, data);
      } else {
        entity = this.genericRepository.create(data);
      }

      if (flush) {
        await this.genericRepository.persistAndFlush(entity);
      } else {
        await this.genericRepository.persist(entity);
      }
      return entity;
    } catch (err) {
      this.catchError(err);
    }
  }
}
