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
exports.Course = exports.Campus = exports.University = void 0;
const typeorm_1 = require("typeorm");
let University = class University {
    id;
    name;
    location;
    website;
    logo_url;
    created_at;
    updated_at;
    campuses;
};
exports.University = University;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], University.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], University.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], University.prototype, "location", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], University.prototype, "website", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], University.prototype, "logo_url", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], University.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], University.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Campus, (campus) => campus.university),
    __metadata("design:type", Array)
], University.prototype, "campuses", void 0);
exports.University = University = __decorate([
    (0, typeorm_1.Entity)('universities')
], University);
let Campus = class Campus {
    id;
    universityId;
    name;
    location;
    created_at;
    updated_at;
    university;
    courses;
};
exports.Campus = Campus;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Campus.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)('uuid', { name: 'universityId' }),
    __metadata("design:type", String)
], Campus.prototype, "universityId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Campus.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Campus.prototype, "location", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Campus.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Campus.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => University, (university) => university.campuses),
    (0, typeorm_1.JoinColumn)({ name: 'universityId' }),
    __metadata("design:type", University)
], Campus.prototype, "university", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Course, (course) => course.campus),
    __metadata("design:type", Array)
], Campus.prototype, "courses", void 0);
exports.Campus = Campus = __decorate([
    (0, typeorm_1.Entity)('campuses')
], Campus);
let Course = class Course {
    id;
    campusId;
    universityId;
    courseTitle;
    anzscoCode;
    anzscoTitle;
    duration;
    qualification;
    annualFees;
    isRegionalPointsEligible;
    isActive;
    created_at;
    updated_at;
    campus;
    university;
};
exports.Course = Course;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Course.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)('uuid', { name: 'campusId' }),
    __metadata("design:type", String)
], Course.prototype, "campusId", void 0);
__decorate([
    (0, typeorm_1.Column)('uuid', { name: 'universityId' }),
    __metadata("design:type", String)
], Course.prototype, "universityId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Course.prototype, "courseTitle", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Course.prototype, "anzscoCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Course.prototype, "anzscoTitle", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Course.prototype, "duration", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Course.prototype, "qualification", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', nullable: true }),
    __metadata("design:type", Number)
], Course.prototype, "annualFees", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], Course.prototype, "isRegionalPointsEligible", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
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
__decorate([
    (0, typeorm_1.ManyToOne)(() => Campus, (campus) => campus.courses),
    (0, typeorm_1.JoinColumn)({ name: 'campusId' }),
    __metadata("design:type", Campus)
], Course.prototype, "campus", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => University),
    (0, typeorm_1.JoinColumn)({ name: 'universityId' }),
    __metadata("design:type", University)
], Course.prototype, "university", void 0);
exports.Course = Course = __decorate([
    (0, typeorm_1.Entity)('courses')
], Course);
//# sourceMappingURL=university.entity.js.map