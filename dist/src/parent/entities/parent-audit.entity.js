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
exports.ParentAudit = void 0;
const typeorm_1 = require("typeorm");
let ParentAudit = class ParentAudit {
    id;
    sponsorStatus;
    sponsorMonthsInAustralia;
    totalChildren;
    childrenInAustralia;
    childrenInLargestOtherCountry;
    sponsorTaxableIncome;
    parentAge;
    isEligible;
    status;
    balancePercentage;
    balancePass;
    sponsorCheckPass;
    aosMeetsBenchmark;
    requiresCoAssurer;
    predictedSubclass;
    recommendations;
    created_at;
};
exports.ParentAudit = ParentAudit;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ParentAudit.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'sponsor_status', type: 'varchar' }),
    __metadata("design:type", String)
], ParentAudit.prototype, "sponsorStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'sponsor_months_in_australia', type: 'int' }),
    __metadata("design:type", Number)
], ParentAudit.prototype, "sponsorMonthsInAustralia", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_children', type: 'int' }),
    __metadata("design:type", Number)
], ParentAudit.prototype, "totalChildren", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'children_in_australia', type: 'int' }),
    __metadata("design:type", Number)
], ParentAudit.prototype, "childrenInAustralia", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'children_in_largest_other_country', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], ParentAudit.prototype, "childrenInLargestOtherCountry", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'sponsor_taxable_income', type: 'int' }),
    __metadata("design:type", Number)
], ParentAudit.prototype, "sponsorTaxableIncome", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'parent_age', type: 'int' }),
    __metadata("design:type", Number)
], ParentAudit.prototype, "parentAge", void 0);
__decorate([
    (0, typeorm_1.Index)('idx_parent_audits_eligible'),
    (0, typeorm_1.Column)({ name: 'is_eligible', type: 'boolean' }),
    __metadata("design:type", Boolean)
], ParentAudit.prototype, "isEligible", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], ParentAudit.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'balance_percentage', type: 'int' }),
    __metadata("design:type", Number)
], ParentAudit.prototype, "balancePercentage", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'balance_pass', type: 'boolean' }),
    __metadata("design:type", Boolean)
], ParentAudit.prototype, "balancePass", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'sponsor_check_pass', type: 'boolean' }),
    __metadata("design:type", Boolean)
], ParentAudit.prototype, "sponsorCheckPass", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'aos_meets_benchmark', type: 'boolean' }),
    __metadata("design:type", Boolean)
], ParentAudit.prototype, "aosMeetsBenchmark", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'requires_co_assurer', type: 'boolean' }),
    __metadata("design:type", Boolean)
], ParentAudit.prototype, "requiresCoAssurer", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'predicted_subclass', type: 'varchar' }),
    __metadata("design:type", String)
], ParentAudit.prototype, "predictedSubclass", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], ParentAudit.prototype, "recommendations", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], ParentAudit.prototype, "created_at", void 0);
exports.ParentAudit = ParentAudit = __decorate([
    (0, typeorm_1.Entity)('parent_audits')
], ParentAudit);
//# sourceMappingURL=parent-audit.entity.js.map