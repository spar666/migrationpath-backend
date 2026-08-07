import { Logger } from '@nestjs/common';
import { Repository, FindOptionsWhere, ObjectLiteral, DeepPartial } from 'typeorm';
export interface PaginatedResult<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
export type EntityId = string | number;
export declare abstract class BaseRepository<T extends ObjectLiteral> {
    protected readonly repository: Repository<T>;
    protected readonly logger: Logger;
    constructor(repository: Repository<T>);
    findAll(filters?: FindOptionsWhere<T>): Promise<T[]>;
    findById(id: EntityId): Promise<T>;
    findWithRelations(relations: string[], filters?: FindOptionsWhere<T>): Promise<T[]>;
    create(data: DeepPartial<T>): Promise<T>;
    update(id: EntityId, data: Partial<T>): Promise<T>;
    softDelete(id: EntityId): Promise<void>;
    hardDelete(id: EntityId): Promise<void>;
    delete(id: EntityId): Promise<boolean>;
    paginate(page?: number, limit?: number, filters?: FindOptionsWhere<T>, sortBy?: string, sortOrder?: 'ASC' | 'DESC'): Promise<PaginatedResult<T>>;
    count(filters?: FindOptionsWhere<T>): Promise<number>;
    exists(filters: FindOptionsWhere<T>): Promise<boolean>;
    private buildOrder;
    private handleError;
}
