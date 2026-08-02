"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployerSponsoredModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const sponsor_entity_1 = require("./entities/sponsor.entity");
const nomination_entity_1 = require("./entities/nomination.entity");
const sponsor_repository_1 = require("./sponsor.repository");
const nomination_repository_1 = require("./nomination.repository");
const employer_sponsored_engine_1 = require("./employer-sponsored.engine");
let EmployerSponsoredModule = class EmployerSponsoredModule {
};
exports.EmployerSponsoredModule = EmployerSponsoredModule;
exports.EmployerSponsoredModule = EmployerSponsoredModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([sponsor_entity_1.Sponsor, nomination_entity_1.Nomination])],
        providers: [sponsor_repository_1.SponsorRepository, nomination_repository_1.NominationRepository, employer_sponsored_engine_1.EmployerSponsoredEngine],
        exports: [
            sponsor_repository_1.SponsorRepository,
            nomination_repository_1.NominationRepository,
            employer_sponsored_engine_1.EmployerSponsoredEngine,
            typeorm_1.TypeOrmModule,
        ],
    })
], EmployerSponsoredModule);
//# sourceMappingURL=employer-sponsored.module.js.map