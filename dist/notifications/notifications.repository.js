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
exports.NotificationPreferencesRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const base_repository_1 = require("../common/repositories/base.repository");
const notification_entity_1 = require("./entities/notification.entity");
let NotificationPreferencesRepository = class NotificationPreferencesRepository extends base_repository_1.BaseRepository {
    notificationPreferenceRepository;
    constructor(notificationPreferenceRepository) {
        super(notificationPreferenceRepository);
        this.notificationPreferenceRepository = notificationPreferenceRepository;
    }
    async findByUserId(userId) {
        const prefs = await this.repository.findOne({
            where: { user_id: userId },
        });
        if (!prefs) {
            throw new common_1.NotFoundException(`Notification preferences for user ${userId} not found`);
        }
        return prefs;
    }
    async updateByUserId(userId, data) {
        await this.repository.update({ user_id: userId }, data);
        return this.findByUserId(userId);
    }
};
exports.NotificationPreferencesRepository = NotificationPreferencesRepository;
exports.NotificationPreferencesRepository = NotificationPreferencesRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(notification_entity_1.NotificationPreference)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], NotificationPreferencesRepository);
//# sourceMappingURL=notifications.repository.js.map