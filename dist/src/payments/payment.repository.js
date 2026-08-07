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
exports.PaymentRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const base_repository_1 = require("../common/repositories/base.repository");
const payment_entity_1 = require("./entities/payment.entity");
const consultation_entity_1 = require("../consultation/entities/consultation.entity");
let PaymentRepository = class PaymentRepository extends base_repository_1.BaseRepository {
    paymentRepository;
    constructor(paymentRepository) {
        super(paymentRepository);
        this.paymentRepository = paymentRepository;
    }
    async markPaidWithBooking(paymentId, bookingId, patch) {
        return this.paymentRepository.manager.transaction(async (manager) => {
            await manager.update(payment_entity_1.Payment, paymentId, patch);
            if (bookingId) {
                await manager.update(consultation_entity_1.ConsultationBooking, bookingId, {
                    status: 'confirmed',
                });
            }
            const updated = await manager.findOne(payment_entity_1.Payment, {
                where: { id: paymentId },
            });
            if (!updated) {
                throw new Error(`Payment ${paymentId} disappeared during confirmation`);
            }
            return updated;
        });
    }
    findBySessionId(sessionId) {
        return this.paymentRepository.findOne({
            where: { provider_session_id: sessionId },
        });
    }
    findByProspectId(prospectId) {
        return this.paymentRepository.find({
            where: { prospect_id: prospectId },
            order: { created_at: 'DESC' },
        });
    }
    async hasPaidFor(prospectId, purpose) {
        const count = await this.paymentRepository.count({
            where: { prospect_id: prospectId, purpose, status: 'paid' },
        });
        return count > 0;
    }
    async findOpenSessionForBooking(bookingId, maxAgeMs) {
        const [open] = await this.paymentRepository.find({
            where: {
                booking_id: bookingId,
                status: 'created',
                provider_session_id: (0, typeorm_2.Not)((0, typeorm_2.IsNull)()),
                created_at: (0, typeorm_2.MoreThan)(new Date(Date.now() - maxAgeMs)),
            },
            order: { created_at: 'DESC' },
            take: 1,
        });
        return open ?? null;
    }
    findStaleOpenSessions(olderThanMs, limit = 100) {
        return this.paymentRepository.find({
            where: {
                status: 'created',
                provider_session_id: (0, typeorm_2.Not)((0, typeorm_2.IsNull)()),
                created_at: (0, typeorm_2.LessThan)(new Date(Date.now() - olderThanMs)),
            },
            order: { created_at: 'ASC' },
            take: limit,
        });
    }
};
exports.PaymentRepository = PaymentRepository;
exports.PaymentRepository = PaymentRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(payment_entity_1.Payment)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], PaymentRepository);
//# sourceMappingURL=payment.repository.js.map