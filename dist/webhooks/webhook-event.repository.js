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
var WebhookEventRepository_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookEventRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const base_repository_1 = require("../common/repositories/base.repository");
const webhook_event_entity_1 = require("./entities/webhook-event.entity");
let WebhookEventRepository = WebhookEventRepository_1 = class WebhookEventRepository extends base_repository_1.BaseRepository {
    webhookRepository;
    logger = new common_1.Logger(WebhookEventRepository_1.name);
    constructor(webhookRepository) {
        super(webhookRepository);
        this.webhookRepository = webhookRepository;
    }
    async claim(provider, externalId, eventType, payload) {
        try {
            const result = await this.webhookRepository
                .createQueryBuilder()
                .insert()
                .into(webhook_event_entity_1.WebhookEvent)
                .values({
                provider,
                external_id: externalId,
                event_type: eventType,
                payload,
                status: 'received',
            })
                .orIgnore()
                .returning('*')
                .execute();
            const row = result.raw?.[0];
            if (!row) {
                this.logger.log(`Duplicate ${provider} webhook ${externalId} (${eventType}) — already handled`);
                return null;
            }
            return row;
        }
        catch (error) {
            this.logger.error(`Failed to record ${provider} webhook ${externalId}: ${error.message}`);
            throw error;
        }
    }
    async markProcessed(id) {
        await this.webhookRepository.update(id, {
            status: 'processed',
            processed_at: new Date(),
        });
    }
    async markFailed(id, error) {
        await this.webhookRepository.update(id, {
            status: 'failed',
            error: error.slice(0, 2000),
        });
    }
};
exports.WebhookEventRepository = WebhookEventRepository;
exports.WebhookEventRepository = WebhookEventRepository = WebhookEventRepository_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(webhook_event_entity_1.WebhookEvent)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], WebhookEventRepository);
//# sourceMappingURL=webhook-event.repository.js.map