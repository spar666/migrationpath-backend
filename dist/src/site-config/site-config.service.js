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
var SiteConfigService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SiteConfigService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const site_config_entity_1 = require("./entities/site-config.entity");
const DEFAULT_CONFIG = {
    home: {
        heroHeadline: 'Your Pathway to Australian Migration',
        heroSubtext: 'Navigate the 2026 migration landscape with expert-led strategy tools and real-time points optimization.',
        heroImage: '',
        primaryCta: 'Get Started',
        secondaryCta: 'Check My Points',
        outlookTitle: '2026 Migration Outlook',
        outlookDescription: 'Australia is shifting toward a skills-first model. The new Skills in Demand (SID) visa offers a 2-year pathway to PR for eligible professionals.',
        processingTimeHealthcare: '7 Days',
        processingTimeTech: '14 Days',
        benefits: [
            'MARA Registered Agents',
            '2026 Priority Lists',
            'Real-Time Points Optimizer',
        ],
    },
    student: {
        heroHeadline: 'Study Your Way to Australian PR',
        heroSubtext: 'Strategic course selection that maximizes your points and accelerates your permanent residency pathway.',
        heroImage: '',
        primaryCta: 'Find Your Course',
        secondaryCta: 'Calculate Points',
        benefits: [
            'Regional Study Bonus',
            'Post-Study Work Rights',
            'Direct PR Pathways',
        ],
    },
    skilled: {
        heroHeadline: 'Skilled Migration Made Simple',
        heroSubtext: 'Expert guidance for 189, 190, and 491 visa pathways. Real-time state nomination insights.',
        heroImage: '',
        primaryCta: 'Check Eligibility',
        secondaryCta: 'State Requirements',
        benefits: [
            'EOI Optimization',
            'State Priority Matching',
            'Skills Assessment Support',
        ],
    },
    partner: {
        heroHeadline: 'Partner Visa Pathways',
        heroSubtext: 'Comprehensive support for partner and prospective marriage visa applications.',
        heroImage: '',
        primaryCta: 'Start Application',
        secondaryCta: 'Evidence Checklist',
        benefits: [
            'Evidence Planning',
            'Timeline Management',
            'Relationship Documentation',
        ],
    },
    onshore: {
        heroHeadline: 'Onshore to PR Strategy',
        heroSubtext: 'Transform your temporary visa into permanent residency with our strategic audit and planning tools.',
        heroImage: '',
        primaryCta: 'Get Strategy Audit',
        secondaryCta: 'Calculate My Points',
        benefits: [
            'Visa Bridge Planning',
            'Work Experience Tracking',
            'Points Optimization',
        ],
    },
    footer: {
        maraStatement: 'MigrationPath is operated by registered migration agents. MARA Registration: XXXXXX',
        quickLinks: ['Home', 'Points Calculator', 'News', 'Contact'],
        resourceLinks: [
            '2026 Priority Occupation List',
            'State Nomination Requirements',
            'Processing Times',
        ],
    },
};
const CONFIG_KEY = 'site_config';
let SiteConfigService = SiteConfigService_1 = class SiteConfigService {
    repo;
    logger = new common_1.Logger(SiteConfigService_1.name);
    constructor(repo) {
        this.repo = repo;
    }
    async getConfig() {
        const row = await this.repo.findOne({ where: { configKey: CONFIG_KEY } });
        if (row) {
            return row.configData;
        }
        this.logger.log('No site_config row found — returning built-in defaults');
        return DEFAULT_CONFIG;
    }
    async updateConfig(dto, userId) {
        let row = await this.repo.findOne({ where: { configKey: CONFIG_KEY } });
        if (row) {
            row.configData = dto;
            row.updatedBy = userId ?? null;
        }
        else {
            row = this.repo.create({
                configKey: CONFIG_KEY,
                configData: dto,
                updatedBy: userId ?? null,
            });
        }
        const saved = await this.repo.save(row);
        this.logger.log(`Site config updated by user ${userId ?? 'unknown'}`);
        return saved.configData;
    }
};
exports.SiteConfigService = SiteConfigService;
exports.SiteConfigService = SiteConfigService = SiteConfigService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(site_config_entity_1.SiteConfig)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], SiteConfigService);
//# sourceMappingURL=site-config.service.js.map