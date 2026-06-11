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
exports.ConsultationBookingRepository = exports.ConsultationQuestionnaireRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const base_repository_1 = require("../common/repositories/base.repository");
const consultation_entity_1 = require("./entities/consultation.entity");
let ConsultationQuestionnaireRepository = class ConsultationQuestionnaireRepository extends base_repository_1.BaseRepository {
    questionnaireRepository;
    constructor(questionnaireRepository) {
        super(questionnaireRepository);
        this.questionnaireRepository = questionnaireRepository;
    }
    async findLatestByUserId(userId) {
        return this.repository
            .createQueryBuilder('q')
            .leftJoinAndSelect('q.user', 'user')
            .addSelect(['user.id', 'user.email', 'user.full_name'])
            .where('q.user_id = :userId', { userId })
            .orderBy('q.created_at', 'DESC')
            .take(1)
            .getMany();
    }
    async paginateWithUser(page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [data, total] = await this.repository
            .createQueryBuilder('q')
            .leftJoinAndSelect('q.user', 'user')
            .addSelect(['user.id', 'user.email', 'user.full_name'])
            .orderBy('q.created_at', 'DESC')
            .skip(skip)
            .take(limit)
            .getManyAndCount();
        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
};
exports.ConsultationQuestionnaireRepository = ConsultationQuestionnaireRepository;
exports.ConsultationQuestionnaireRepository = ConsultationQuestionnaireRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(consultation_entity_1.ConsultationQuestionnaire)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ConsultationQuestionnaireRepository);
let ConsultationBookingRepository = class ConsultationBookingRepository extends base_repository_1.BaseRepository {
    bookingRepository;
    constructor(bookingRepository) {
        super(bookingRepository);
        this.bookingRepository = bookingRepository;
    }
    async deliverStrategy(id, strategy) {
        return this.update(id, {
            strategy_delivery: strategy,
            status: 'completed',
        });
    }
};
exports.ConsultationBookingRepository = ConsultationBookingRepository;
exports.ConsultationBookingRepository = ConsultationBookingRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(consultation_entity_1.ConsultationBooking)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ConsultationBookingRepository);
//# sourceMappingURL=consultation.repository.js.map