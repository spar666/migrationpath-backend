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
exports.ConsultationService = void 0;
const common_1 = require("@nestjs/common");
const consultation_repository_1 = require("./consultation.repository");
let ConsultationService = class ConsultationService {
    questionnaireRepo;
    bookingRepo;
    constructor(questionnaireRepo, bookingRepo) {
        this.questionnaireRepo = questionnaireRepo;
        this.bookingRepo = bookingRepo;
    }
    async submitQuestionnaire(userId, responses) {
        return this.questionnaireRepo.create({
            user_id: userId,
            responses,
        });
    }
    async findMyQuestionnaire(userId) {
        return this.questionnaireRepo.findLatestByUserId(userId);
    }
    async findAllQuestionnaires(page, limit) {
        return this.questionnaireRepo.paginateWithUser(page, limit);
    }
    async findAllBookings(page, limit) {
        return this.bookingRepo.paginate(page, limit);
    }
    async deliverStrategy(id, strategy) {
        return this.bookingRepo.deliverStrategy(id, strategy);
    }
    async deleteBooking(id) {
        return this.bookingRepo.hardDelete(id);
    }
};
exports.ConsultationService = ConsultationService;
exports.ConsultationService = ConsultationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [consultation_repository_1.ConsultationQuestionnaireRepository,
        consultation_repository_1.ConsultationBookingRepository])
], ConsultationService);
//# sourceMappingURL=consultation.service.js.map