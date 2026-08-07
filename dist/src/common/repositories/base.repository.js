"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const PG_UNIQUE_VIOLATION = '23505';
const PG_FOREIGN_KEY_VIOLATION = '23503';
const PG_NOT_NULL_VIOLATION = '23502';
const PG_INVALID_TEXT_REPRESENTATION = '22P02';
function asDatabaseError(error) {
    return typeof error === 'object' && error !== null ? error : {};
}
let BaseRepository = class BaseRepository {
    repository;
    logger = new common_1.Logger(this.constructor.name);
    constructor(repository) {
        this.repository = repository;
    }
    findAll(filters) {
        return this.repository.find({ where: filters });
    }
    async findById(id) {
        const record = await this.repository.findOne({
            where: { id },
        });
        if (!record) {
            throw new common_1.HttpException('Resource not found', common_1.HttpStatus.NOT_FOUND);
        }
        return record;
    }
    findWithRelations(relations, filters) {
        return this.repository.find({ where: filters, relations });
    }
    async create(data) {
        try {
            const entity = this.repository.create(data);
            return await this.repository.save(entity);
        }
        catch (error) {
            this.handleError(error);
        }
    }
    async update(id, data) {
        try {
            const result = await this.repository.update(id, data);
            if (result.affected === 0) {
                throw new common_1.HttpException('Resource not found', common_1.HttpStatus.NOT_FOUND);
            }
            return await this.findById(id);
        }
        catch (error) {
            this.handleError(error);
        }
    }
    async softDelete(id) {
        try {
            const result = await this.repository.softDelete(id);
            if (result.affected === 0) {
                throw new common_1.HttpException('Resource not found', common_1.HttpStatus.NOT_FOUND);
            }
        }
        catch (error) {
            this.handleError(error);
        }
    }
    async hardDelete(id) {
        try {
            const result = await this.repository.delete(id);
            if (result.affected === 0) {
                throw new common_1.HttpException('Resource not found', common_1.HttpStatus.NOT_FOUND);
            }
        }
        catch (error) {
            this.handleError(error);
        }
    }
    async delete(id) {
        await this.hardDelete(id);
        return true;
    }
    async paginate(page = 1, limit = 20, filters, sortBy = 'created_at', sortOrder = 'DESC') {
        const safePage = Math.max(1, Math.floor(page) || 1);
        const safeLimit = Math.min(Math.max(1, Math.floor(limit) || 20), 200);
        const [data, total] = await this.repository.findAndCount({
            where: filters,
            order: this.buildOrder(sortBy, sortOrder),
            skip: (safePage - 1) * safeLimit,
            take: safeLimit,
        });
        return {
            data,
            total,
            page: safePage,
            limit: safeLimit,
            totalPages: Math.ceil(total / safeLimit) || 1,
        };
    }
    count(filters) {
        return this.repository.count({ where: filters });
    }
    async exists(filters) {
        return (await this.count(filters)) > 0;
    }
    buildOrder(sortBy, sortOrder) {
        const columns = this.repository.metadata.columns.map((column) => column.propertyName);
        if (!columns.includes(sortBy)) {
            this.logger.warn(`Ignoring unknown sort column "${sortBy}" on ` +
                `${this.repository.metadata.name}; falling back to created_at.`);
            sortBy = columns.includes('created_at') ? 'created_at' : columns[0];
        }
        return { [sortBy]: sortOrder };
    }
    handleError(error) {
        if (error instanceof common_1.HttpException) {
            throw error;
        }
        const dbError = asDatabaseError(error);
        this.logger.error(`DB error on ${this.repository.metadata.name}`, {
            code: dbError.code,
            message: dbError.message,
        });
        switch (dbError.code) {
            case PG_UNIQUE_VIOLATION:
                throw new common_1.HttpException('Record already exists', common_1.HttpStatus.CONFLICT);
            case PG_FOREIGN_KEY_VIOLATION:
                throw new common_1.HttpException('Foreign key constraint violation', common_1.HttpStatus.BAD_REQUEST);
            case PG_NOT_NULL_VIOLATION:
                throw new common_1.HttpException('A required field was missing', common_1.HttpStatus.BAD_REQUEST);
            case PG_INVALID_TEXT_REPRESENTATION:
                throw new common_1.HttpException('Malformed identifier', common_1.HttpStatus.BAD_REQUEST);
            default:
                throw new common_1.HttpException('Database error', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.BaseRepository = BaseRepository;
exports.BaseRepository = BaseRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.Repository])
], BaseRepository);
//# sourceMappingURL=base.repository.js.map