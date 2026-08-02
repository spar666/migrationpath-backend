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
exports.ProspectRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const base_repository_1 = require("../common/repositories/base.repository");
const prospect_entity_1 = require("./entities/prospect.entity");
let ProspectRepository = class ProspectRepository extends base_repository_1.BaseRepository {
    prospectRepository;
    constructor(prospectRepository) {
        super(prospectRepository);
        this.prospectRepository = prospectRepository;
    }
    findByHumanRef(humanRef) {
        return this.prospectRepository.findOne({
            where: { human_ref: humanRef.toUpperCase() },
        });
    }
    findByEmail(email) {
        return this.prospectRepository.findOne({
            where: { email: email.toLowerCase() },
            order: { created_at: 'DESC' },
        });
    }
    findOneById(id) {
        return this.prospectRepository.findOne({ where: { id } });
    }
    humanRefExists(humanRef) {
        return this.prospectRepository
            .count({ where: { human_ref: humanRef } })
            .then((c) => c > 0);
    }
};
exports.ProspectRepository = ProspectRepository;
exports.ProspectRepository = ProspectRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(prospect_entity_1.Prospect)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ProspectRepository);
//# sourceMappingURL=prospect.repository.js.map