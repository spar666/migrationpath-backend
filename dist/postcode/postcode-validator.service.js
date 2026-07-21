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
var PostcodeValidatorService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostcodeValidatorService = void 0;
const common_1 = require("@nestjs/common");
const points_catalogue_1 = require("../points-engine/constants/points-catalogue");
const regional_postcode_service_1 = require("../regional-postcode/regional-postcode.service");
let PostcodeValidatorService = PostcodeValidatorService_1 = class PostcodeValidatorService {
    regionalPostcodes;
    logger = new common_1.Logger(PostcodeValidatorService_1.name);
    constructor(regionalPostcodes) {
        this.regionalPostcodes = regionalPostcodes;
    }
    validate(rawPostcode) {
        const postcode = this.normalize(rawPostcode);
        if (postcode === null) {
            return {
                postcode: String(rawPostcode ?? ''),
                isRegional: false,
                category: 'UNKNOWN',
                region: null,
                points: 0,
                needsReview: true,
            };
        }
        const bands = this.regionalPostcodes.getCachedBands();
        const metro = this.findBand(postcode, bands.metro);
        if (metro) {
            return { postcode: this.pad(postcode), isRegional: false, category: 'METRO', region: metro, points: 0, needsReview: false };
        }
        const cat2 = this.findBand(postcode, bands.cat2);
        if (cat2) {
            return { postcode: this.pad(postcode), isRegional: true, category: 'CATEGORY_2', region: cat2, points: points_catalogue_1.REGIONAL_STUDY_POINTS, needsReview: false };
        }
        const cat3 = this.findBand(postcode, bands.cat3);
        if (cat3) {
            return { postcode: this.pad(postcode), isRegional: true, category: 'CATEGORY_3', region: cat3, points: points_catalogue_1.REGIONAL_STUDY_POINTS, needsReview: false };
        }
        this.logger.warn(`Postcode ${this.pad(postcode)} is not in the regional lookup set — flagged needsReview.`);
        return { postcode: this.pad(postcode), isRegional: false, category: 'UNKNOWN', region: null, points: 0, needsReview: true };
    }
    isRegional(postcode) {
        return this.validate(postcode).isRegional;
    }
    findBand(postcode, bands) {
        for (const band of bands) {
            if (band.ranges.some(([from, to]) => postcode >= from && postcode <= to)) {
                return band.region;
            }
        }
        return null;
    }
    normalize(raw) {
        if (raw === null || raw === undefined)
            return null;
        const digits = String(raw).trim().replace(/\D/g, '');
        if (digits.length < 3 || digits.length > 4)
            return null;
        const value = parseInt(digits, 10);
        return Number.isNaN(value) ? null : value;
    }
    pad(postcode) {
        return postcode.toString().padStart(4, '0');
    }
};
exports.PostcodeValidatorService = PostcodeValidatorService;
exports.PostcodeValidatorService = PostcodeValidatorService = PostcodeValidatorService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [regional_postcode_service_1.RegionalPostcodeService])
], PostcodeValidatorService);
//# sourceMappingURL=postcode-validator.service.js.map