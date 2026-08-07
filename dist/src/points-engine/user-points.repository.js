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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserPointsRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const base_repository_1 = require("../common/repositories/base.repository");
const user_points_entity_1 = require("./entities/user-points.entity");
let UserPointsRepository = class UserPointsRepository extends base_repository_1.BaseRepository {
    repo;
    constructor(repo) {
        super(repo);
        this.repo = repo;
    }
    async findAllByUserId(userId) {
        return this.repo.find({
            where: { user_id: userId },
            order: { created_at: 'DESC' },
        });
    }
    async findLatestByUserId(userId) {
        return this.repo.findOne({
            where: { user_id: userId },
            order: { created_at: 'DESC' },
        });
    }
    async findRecentByUserId(userId, limit) {
        return this.repo.find({
            where: { user_id: userId },
            order: { created_at: 'DESC' },
            take: limit,
        });
    }
};
exports.UserPointsRepository = UserPointsRepository;
exports.UserPointsRepository = UserPointsRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_points_entity_1.UserPoints)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], UserPointsRepository);
//# sourceMappingURL=user-points.repository.js.map