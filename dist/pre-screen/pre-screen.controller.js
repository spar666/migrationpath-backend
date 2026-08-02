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
exports.PreScreenController = void 0;
const common_1 = require("@nestjs/common");
const throttler_1 = require("@nestjs/throttler");
const swagger_1 = require("@nestjs/swagger");
const pre_screen_service_1 = require("./pre-screen.service");
const submit_pre_screen_dto_1 = require("./dto/submit-pre-screen.dto");
let PreScreenController = class PreScreenController {
    preScreenService;
    constructor(preScreenService) {
        this.preScreenService = preScreenService;
    }
    submit(dto) {
        return this.preScreenService.submit(dto);
    }
};
exports.PreScreenController = PreScreenController;
__decorate([
    (0, common_1.Post)(),
    (0, throttler_1.Throttle)({ default: { limit: 5, ttl: 60000 } }),
    (0, swagger_1.ApiOperation)({
        summary: 'Submit the employer-sponsored pre-screen questionnaire (public)',
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Returns the live eligibility result plus the prospect id and human reference',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [submit_pre_screen_dto_1.SubmitPreScreenDto]),
    __metadata("design:returntype", void 0)
], PreScreenController.prototype, "submit", null);
exports.PreScreenController = PreScreenController = __decorate([
    (0, swagger_1.ApiTags)('pre-screen'),
    (0, common_1.Controller)('pre-screen'),
    __metadata("design:paramtypes", [pre_screen_service_1.PreScreenService])
], PreScreenController);
//# sourceMappingURL=pre-screen.controller.js.map