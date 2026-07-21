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
exports.StateNominationsRepository = exports.TrendsRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const base_repository_1 = require("../common/repositories/base.repository");
const analytics_entity_1 = require("./entities/analytics.entity");
let TrendsRepository = class TrendsRepository extends base_repository_1.BaseRepository {
    trendRepository;
    constructor(trendRepository) {
        super(trendRepository);
        this.trendRepository = trendRepository;
    }
    async findByOccupation(anzscoCode) {
        return this.findAll({ anzsco_code: anzscoCode });
    }
};
exports.TrendsRepository = TrendsRepository;
exports.TrendsRepository = TrendsRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(analytics_entity_1.InvitationTrend)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], TrendsRepository);
let StateNominationsRepository = class StateNominationsRepository extends base_repository_1.BaseRepository {
    stateNominationRepository;
    constructor(stateNominationRepository) {
        super(stateNominationRepository);
        this.stateNominationRepository = stateNominationRepository;
    }
    async findByState(stateCode) {
        return this.findAll({ state_code: stateCode });
    }
};
exports.StateNominationsRepository = StateNominationsRepository;
exports.StateNominationsRepository = StateNominationsRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(analytics_entity_1.StateNomination)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], StateNominationsRepository);
//# sourceMappingURL=analytics.repository.js.map