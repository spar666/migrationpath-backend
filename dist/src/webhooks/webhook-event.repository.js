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
const LEASE_MS = 5 * 60 * 1000;
let WebhookEventRepository = WebhookEventRepository_1 = class WebhookEventRepository extends base_repository_1.BaseRepository {
    webhookRepository;
    logger = new common_1.Logger(WebhookEventRepository_1.name);
    constructor(webhookRepository) {
        super(webhookRepository);
        this.webhookRepository = webhookRepository;
    }
    async claim(provider, externalId, eventType, payload) {
        try {
            const staleAfter = new Date(Date.now() - LEASE_MS);
            const result = await this.webhookRepository.query(`
        INSERT INTO webhook_events
          (provider, external_id, event_type, payload, status, claimed_at, attempts)
        VALUES ($1, $2, $3, $4, 'received', now(), 1)
        ON CONFLICT (provider, external_id) DO UPDATE
          SET claimed_at = now(),
              attempts   = webhook_events.attempts + 1,
              status     = 'received'
          WHERE webhook_events.status <> 'processed'
            AND (webhook_events.claimed_at IS NULL
                 OR webhook_events.claimed_at < $5)
        RETURNING *
        `, [provider, externalId, eventType, payload, staleAfter]);
            const row = result[0];
            if (!row) {
                this.logger.log(`Skipping ${provider} webhook ${externalId} (${eventType}) — ` +
                    `already processed, or in flight elsewhere`);
                return null;
            }
            if (row.attempts > 1) {
                this.logger.warn(`Re-processing ${provider} webhook ${externalId} (${eventType}), ` +
                    `attempt ${row.attempts}. The previous attempt did not finish — ` +
                    `usually a restart mid-handler.`);
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