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
exports.InvitationDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class InvitationDto {
    id;
    occupation;
    visa_class;
    state;
    points;
    days_ago;
    priority;
}
exports.InvitationDto = InvitationDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], InvitationDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], InvitationDto.prototype, "occupation", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ name: 'visa_class' }),
    __metadata("design:type", String)
], InvitationDto.prototype, "visa_class", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], InvitationDto.prototype, "state", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], InvitationDto.prototype, "points", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ name: 'days_ago' }),
    __metadata("design:type", Number)
], InvitationDto.prototype, "days_ago", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], InvitationDto.prototype, "priority", void 0);
//# sourceMappingURL=invitation.dto.js.map