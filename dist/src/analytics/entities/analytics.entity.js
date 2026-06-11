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
exports.StateNomination = exports.InvitationTrend = void 0;
const typeorm_1 = require("typeorm");
let InvitationTrend = class InvitationTrend {
    id;
    anzsco_code;
    round_date;
    subclass;
    min_points_invited;
    invitations_issued;
    source_url;
    created_at;
};
exports.InvitationTrend = InvitationTrend;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], InvitationTrend.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], InvitationTrend.prototype, "anzsco_code", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Date)
], InvitationTrend.prototype, "round_date", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], InvitationTrend.prototype, "subclass", void 0);
__decorate([
    (0, typeorm_1.Column)('int'),
    __metadata("design:type", Number)
], InvitationTrend.prototype, "min_points_invited", void 0);
__decorate([
    (0, typeorm_1.Column)('int'),
    __metadata("design:type", Number)
], InvitationTrend.prototype, "invitations_issued", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], InvitationTrend.prototype, "source_url", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], InvitationTrend.prototype, "created_at", void 0);
exports.InvitationTrend = InvitationTrend = __decorate([
    (0, typeorm_1.Entity)('invitation_trends')
], InvitationTrend);
let StateNomination = class StateNomination {
    id;
    state_code;
    anzsco_code;
    is_open;
    priority_level;
    additional_requirements;
    last_updated;
    created_at;
};
exports.StateNomination = StateNomination;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], StateNomination.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['NSW', 'VIC', 'QLD', 'SA', 'WA', 'TAS', 'NT', 'ACT'],
    }),
    __metadata("design:type", String)
], StateNomination.prototype, "state_code", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], StateNomination.prototype, "anzsco_code", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], StateNomination.prototype, "is_open", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['high', 'medium', 'low'],
        default: 'medium',
    }),
    __metadata("design:type", String)
], StateNomination.prototype, "priority_level", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], StateNomination.prototype, "additional_requirements", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Date)
], StateNomination.prototype, "last_updated", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], StateNomination.prototype, "created_at", void 0);
exports.StateNomination = StateNomination = __decorate([
    (0, typeorm_1.Entity)('state_nominations')
], StateNomination);
//# sourceMappingURL=analytics.entity.js.map