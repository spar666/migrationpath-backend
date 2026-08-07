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
exports.UserQuote = exports.ServicePackage = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../auth/entities/user.entity");
let ServicePackage = class ServicePackage {
    id;
    package_name;
    visa_subclass;
    category;
    professional_fees;
    government_charges;
    estimated_extras;
    inclusions;
    is_active;
    display_order;
    created_at;
    updated_at;
};
exports.ServicePackage = ServicePackage;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ServicePackage.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ServicePackage.prototype, "package_name", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ServicePackage.prototype, "visa_subclass", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['student', 'skilled', 'family', 'employer'],
    }),
    __metadata("design:type", String)
], ServicePackage.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], ServicePackage.prototype, "professional_fees", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], ServicePackage.prototype, "government_charges", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], ServicePackage.prototype, "estimated_extras", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { array: true }),
    __metadata("design:type", Array)
], ServicePackage.prototype, "inclusions", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], ServicePackage.prototype, "is_active", void 0);
__decorate([
    (0, typeorm_1.Column)('int', { default: 0 }),
    __metadata("design:type", Number)
], ServicePackage.prototype, "display_order", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], ServicePackage.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], ServicePackage.prototype, "updated_at", void 0);
exports.ServicePackage = ServicePackage = __decorate([
    (0, typeorm_1.Entity)('service_packages')
], ServicePackage);
let UserQuote = class UserQuote {
    id;
    user_id;
    package_id;
    status;
    total_amount;
    custom_notes;
    created_at;
    expires_at;
    user;
    package;
};
exports.UserQuote = UserQuote;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], UserQuote.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)('uuid'),
    __metadata("design:type", String)
], UserQuote.prototype, "user_id", void 0);
__decorate([
    (0, typeorm_1.Column)('uuid'),
    __metadata("design:type", String)
], UserQuote.prototype, "package_id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['draft', 'sent', 'accepted', 'expired'],
        default: 'draft',
    }),
    __metadata("design:type", String)
], UserQuote.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], UserQuote.prototype, "total_amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], UserQuote.prototype, "custom_notes", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], UserQuote.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Date)
], UserQuote.prototype, "expires_at", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], UserQuote.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => ServicePackage),
    (0, typeorm_1.JoinColumn)({ name: 'package_id' }),
    __metadata("design:type", ServicePackage)
], UserQuote.prototype, "package", void 0);
exports.UserQuote = UserQuote = __decorate([
    (0, typeorm_1.Entity)('user_quotes')
], UserQuote);
//# sourceMappingURL=pricing.entity.js.map