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
exports.Course = void 0;
const typeorm_1 = require("typeorm");
let Course = class Course {
    id;
    universityName;
    courseTitle;
    anzscoCode;
    anzscoTitle;
    annualFees;
    duration;
    isRegional;
    isActive;
    created_at;
    updated_at;
};
exports.Course = Course;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Course.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'university_name' }),
    __metadata("design:type", String)
], Course.prototype, "universityName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'course_title' }),
    __metadata("design:type", String)
], Course.prototype, "courseTitle", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'anzsco_code', nullable: true }),
    __metadata("design:type", String)
], Course.prototype, "anzscoCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'anzsco_title', nullable: true }),
    __metadata("design:type", String)
], Course.prototype, "anzscoTitle", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'annual_fees', type: 'integer', default: 40000 }),
    __metadata("design:type", Number)
], Course.prototype, "annualFees", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: '2 years' }),
    __metadata("design:type", String)
], Course.prototype, "duration", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_regional', default: false }),
    __metadata("design:type", Boolean)
], Course.prototype, "isRegional", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', default: true }),
    __metadata("design:type", Boolean)
], Course.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Course.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Course.prototype, "updated_at", void 0);
exports.Course = Course = __decorate([
    (0, typeorm_1.Entity)('courses')
], Course);
//# sourceMappingURL=course.entity.js.map