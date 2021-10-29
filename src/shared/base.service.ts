import {
  EntityRepository,
  FilterQuery,
  FindOptions,
  Loaded,
  Populate,
  QueryOrderMap,
} from '@mikro-orm/core';
import {
  Injectable,
  NotFoundException,
  Logger,
  BadRequestException,
} from '@nestjs/common';

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
  async findAll<P extends Populate<T> = any>(
    arg1?: FindOptions<T, P> | P,
    arg2?: QueryOrderMap,
    arg3?: number,
    arg4?: number
  ) {
    try {
      return this.genericRepository.findAll(arg1, arg2, arg3, arg4);
    } catch (err) {
      this.catchError(err);
    }
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
    arg2?: FindOptions<T, P> | P,
    arg3?: QueryOrderMap,
    arg4?: number,
    arg5?: number
  ) {
    try {
      return this.genericRepository.find(arg1, arg2, arg3, arg4, arg5);
    } catch (err) {
      this.catchError(err);
    }
  }

  findOne<P extends Populate<T> = any>(
    where: FilterQuery<T>,
    populate?: P,
    orderBy?: QueryOrderMap
  ): Promise<Loaded<T, P> | null>;
  findOne<P extends Populate<T> = any>(
    where: FilterQuery<T>,
    populate?: FindOptions<T, P>,
    orderBy?: QueryOrderMap
  ): Promise<Loaded<T, P> | null>;
  async findOne<P extends Populate<T> = any>(
    arg1: FilterQuery<T>,
    arg2?: P | FindOptions<T, P>,
    arg3?: QueryOrderMap
  ) {
    try {
      return this.genericRepository.findOne(arg1, arg2, arg3);
    } catch (err) {
      this.catchError(err);
    }
  }

  async update(
    oldPartialEntity: Partial<T>,
    newPartialEntity: Partial<T>
  ): Promise<T> {
    try {
      const foundEntity: T | null = await this.findOne(oldPartialEntity);
      if (foundEntity === null) {
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

  async save(entity: T): Promise<T> {
    try {
      const mergedEntity = this.genericRepository.create(entity);
      await this.genericRepository.persistAndFlush(mergedEntity);
      return entity;
    } catch (err) {
      this.catchError(err);
    }
  }

  async delete(entity: T): Promise<void> {
    try {
      await this.genericRepository.removeAndFlush(entity);
    } catch (err) {
      this.catchError(err);
    }
  }
}
