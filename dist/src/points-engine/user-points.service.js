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
exports.UserPointsService = void 0;
const common_1 = require("@nestjs/common");
const user_points_repository_1 = require("./user-points.repository");
const occupations_service_1 = require("../occupations/occupations.service");
let UserPointsService = class UserPointsService {
    repo;
    occupationsService;
    constructor(repo, occupationsService) {
        this.repo = repo;
        this.occupationsService = occupationsService;
    }
    async save(userId, dto) {
        const totalPoints = typeof dto.breakdown?.totalPoints === 'number'
            ? dto.breakdown.totalPoints
            : Object.values(dto.breakdown || {}).reduce((sum, v) => sum + (typeof v === 'number' ? v : 0), 0);
        return this.repo.create({
            user_id: userId,
            persona_type: dto.personaType,
            total_points: totalPoints,
            breakdown: dto.breakdown,
            selections: dto.selections,
        });
    }
    async getLatest(userId) {
        return this.repo.findLatestByUserId(userId);
    }
    async getHistory(userId, limit = 10) {
        const records = await this.repo.findRecentByUserId(userId, limit);
        return records.map((r) => ({
            timestamp: r.created_at.toISOString(),
            totalPoints: r.total_points,
            breakdown: r.breakdown || {},
        }));
    }
    async compareScenarios(userId, dto) {
        return dto.scenarios.map((scenario) => {
            const points = Object.values(scenario).reduce((sum, v) => sum + (typeof v === 'number' ? v : 0), 0);
            return { scenario, points };
        });
    }
    async getOccupationPoints(anzscoCode) {
        const nameMap = await this.occupationsService.getCanonicalNameMap([
            anzscoCode,
        ]);
        return {
            anzscoCode,
            occupation: nameMap[anzscoCode] ?? anzscoCode,
            basePoints: 60,
            modifiers: {
                state_nomination: 5,
                regional: 15,
                partner: 10,
                professional_year: 5,
            },
        };
    }
    async getEligibilityRanges() {
        return [
            {
                visaType: '189',
                minimumPoints: 65,
                averagePoints: 85,
                percentilePoints: { p50: 80, p75: 90, p90: 100 },
            },
            {
                visaType: '190',
                minimumPoints: 65,
                averagePoints: 80,
                percentilePoints: { p50: 75, p75: 85, p90: 95 },
            },
            {
                visaType: '491',
                minimumPoints: 65,
                averagePoints: 75,
                percentilePoints: { p50: 70, p75: 80, p90: 90 },
            },
            {
                visaType: '188',
                minimumPoints: 65,
                averagePoints: 80,
                percentilePoints: { p50: 75, p75: 85, p90: 95 },
            },
        ];
    }
};
exports.UserPointsService = UserPointsService;
exports.UserPointsService = UserPointsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [user_points_repository_1.UserPointsRepository,
        occupations_service_1.OccupationsService])
], UserPointsService);
//# sourceMappingURL=user-points.service.js.map