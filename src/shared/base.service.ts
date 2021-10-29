import { EntityRepository } from '@mikro-orm/postgresql';
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

  async findAll(...args: Parameters<EntityRepository<T>['findAll']>) {
    return this.genericRepository.findAll(...args).catch(this.catchError);
  }

  async find(...args: Parameters<EntityRepository<T>['find']>) {
    return this.genericRepository.find(...args).catch(this.catchError);
  }

  async findOne(...args: Parameters<EntityRepository<T>['findOne']>) {
    return this.genericRepository.findOne(...args).catch(this.catchError);
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
    return this.genericRepository.removeAndFlush(entity).catch(this.catchError);
  }
}
