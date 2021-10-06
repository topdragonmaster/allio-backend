import { EntityRepository } from '@mikro-orm/core';
import {
  Injectable,
  NotFoundException,
  Logger,
  BadRequestException,
} from '@nestjs/common';

@Injectable()
export abstract class BaseService<T> {
  private readonly logger: Logger;
  constructor(private readonly genericRepository: EntityRepository<T>) {
    this.logger = new Logger(BaseService.name);
  }

  private catchError(err: Error): void {
    this.logger.error(err);
    throw new BadRequestException(err);
  }

  async findAll(): Promise<T[]> {
    try {
      return this.genericRepository.findAll<T>();
    } catch (err) {
      this.catchError(err);
    }
  }

  async findOne(findByEntity: Partial<T>): Promise<T> {
    try {
      return <Promise<T>>this.genericRepository.findOne(findByEntity);
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
