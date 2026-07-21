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
let BaseRepository = class BaseRepository {
    repository;
    logger = new common_1.Logger(this.constructor.name);
    constructor(repository) {
        this.repository = repository;
    }
    async findAll(filters) {
        return this.repository.find({
            where: filters,
        });
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
    async findWithRelations(relations, filters) {
        return this.repository.find({
            where: filters,
            relations,
        });
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
            await this.findById(id);
            await this.repository.update(id, data);
            return this.findById(id);
        }
        catch (error) {
            this.handleError(error);
        }
    }
    async softDelete(id) {
        try {
            await this.findById(id);
            await this.repository.softDelete(id);
        }
        catch (error) {
            this.handleError(error);
        }
    }
    async hardDelete(id) {
        try {
            await this.findById(id);
            await this.repository.delete(id);
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
        const skip = (page - 1) * limit;
        const [data, total] = await this.repository.findAndCount({
            where: filters,
            order: { [sortBy]: sortOrder },
            skip,
            take: limit,
        });
        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async count(filters) {
        return this.repository.count({
            where: filters,
        });
    }
    async exists(filters) {
        const c = await this.count(filters);
        return c > 0;
    }
    handleError(error) {
        this.logger.error(`DB error: ${error.message}`);
        if (error.code === '23505') {
            throw new common_1.HttpException('Record already exists', common_1.HttpStatus.CONFLICT);
        }
        if (error.code === '23503') {
            throw new common_1.HttpException('Foreign key constraint violation', common_1.HttpStatus.BAD_REQUEST);
        }
        throw new common_1.HttpException(error.message || 'Database error', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
    }
};
exports.BaseRepository = BaseRepository;
exports.BaseRepository = BaseRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.Repository])
], BaseRepository);
//# sourceMappingURL=base.repository.js.map