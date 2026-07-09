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
exports.UserProgressService = void 0;
const common_1 = require("@nestjs/common");
const user_progress_repository_1 = require("./user-progress.repository");
let UserProgressService = class UserProgressService {
    progressRepo;
    constructor(progressRepo) {
        this.progressRepo = progressRepo;
    }
    async getMyProgress(userId) {
        return this.progressRepo.findAllByUserId(userId);
    }
    async getOne(userId, id) {
        const record = await this.progressRepo.findOneByUserAndId(userId, id);
        if (!record)
            throw new common_1.NotFoundException('Progress record not found');
        return record;
    }
    async create(userId, dto) {
        return this.progressRepo.create({ ...dto, user_id: userId });
    }
    async update(userId, id, dto) {
        const record = await this.progressRepo.findOneByUserAndId(userId, id);
        if (!record)
            throw new common_1.NotFoundException('Progress record not found');
        const mergedData = { ...(record.data || {}), ...(dto.data || {}) };
        return this.progressRepo.update(id, { ...dto, data: mergedData });
    }
    async remove(userId, id) {
        const record = await this.progressRepo.findOneByUserAndId(userId, id);
        if (!record)
            throw new common_1.NotFoundException('Progress record not found');
        await this.progressRepo.deleteByUserAndId(userId, id);
        return { message: 'Progress deleted successfully' };
    }
};
exports.UserProgressService = UserProgressService;
exports.UserProgressService = UserProgressService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [user_progress_repository_1.UserProgressRepository])
], UserProgressService);
//# sourceMappingURL=user-progress.service.js.map