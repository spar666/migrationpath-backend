"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var LeadNotifierService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeadNotifierService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_1 = __importDefault(require("axios"));
const nodemailer = __importStar(require("nodemailer"));
const SOURCE_LABELS = {
    quote_slideover: 'Header quick quote',
    quote_page: 'Quote page',
    other: 'Other',
};
let LeadNotifierService = LeadNotifierService_1 = class LeadNotifierService {
    configService;
    logger = new common_1.Logger(LeadNotifierService_1.name);
    transporter = null;
    warnedNoChannelsConfigured = false;
    constructor(configService) {
        this.configService = configService;
        const smtp = this.configService.get('notifications.smtp');
        if (smtp?.host && smtp?.user && smtp?.pass) {
            this.transporter = nodemailer.createTransport({
                host: smtp.host,
                port: smtp.port,
                secure: smtp.port === 465,
                auth: { user: smtp.user, pass: smtp.pass },
            });
        }
    }
    async notifyNewLead(lead) {
        const emailConfigured = !!this.transporter;
        const slackConfigured = !!this.configService.get('notifications.slackWebhookUrl');
        if (!emailConfigured && !slackConfigured) {
            if (!this.warnedNoChannelsConfigured) {
                this.logger.warn('New lead captured but no notification channel is configured ' +
                    '(SMTP_HOST/SMTP_USER/SMTP_PASS or SLACK_LEADS_WEBHOOK_URL). ' +
                    'Leads are only visible via GET /leads until this is set up. ' +
                    '(This warning is logged once per server start.)');
                this.warnedNoChannelsConfigured = true;
            }
            return;
        }
        await Promise.allSettled([
            this.sendEmail(lead),
            this.sendSlackMessage(lead),
        ]);
    }
    adminLeadUrl() {
        const base = this.configService.get('notifications.adminBaseUrl');
        return base ? `${base.replace(/\/$/, '')}/admin/leads` : null;
    }
    sourceLabel(lead) {
        return SOURCE_LABELS[lead.source] ?? lead.source;
    }
    async sendEmail(lead) {
        if (!this.transporter)
            return;
        const notifyTo = this.configService.get('notifications.leadNotificationEmail');
        if (!notifyTo) {
            this.logger.warn('SMTP is configured but LEAD_NOTIFICATION_EMAIL is not set — skipping email notification.');
            return;
        }
        const fromAddress = this.configService.get('notifications.smtp.from') ||
            this.configService.get('notifications.smtp.user');
        try {
            await this.transporter.sendMail({
                from: fromAddress,
                to: notifyTo,
                subject: `New lead: ${lead.full_name} (${this.sourceLabel(lead)})`,
                text: this.buildPlainTextBody(lead),
                html: this.buildHtmlBody(lead),
            });
        }
        catch (error) {
            this.logger.error(`Failed to send lead notification email: ${error.message}`);
        }
    }
    async sendSlackMessage(lead) {
        const webhookUrl = this.configService.get('notifications.slackWebhookUrl');
        if (!webhookUrl)
            return;
        try {
            await axios_1.default.post(webhookUrl, this.buildSlackPayload(lead));
        }
        catch (error) {
            this.logger.error(`Failed to send Slack lead notification: ${error.message}`);
        }
    }
    buildPlainTextBody(lead) {
        const lines = [
            `A new lead was just captured on the site (source: ${this.sourceLabel(lead)}).`,
            '',
            `Name: ${lead.full_name}`,
            `Email: ${lead.email}`,
        ];
        if (lead.phone)
            lines.push(`Phone: ${lead.phone}`);
        if (lead.visa_type)
            lines.push(`Visa interest: ${lead.visa_type}`);
        if (lead.message)
            lines.push(`Message: ${lead.message}`);
        const adminUrl = this.adminLeadUrl();
        lines.push('', adminUrl
            ? `View all leads: ${adminUrl}`
            : 'View all leads in the admin panel or via GET /leads.');
        return lines.join('\n');
    }
    buildHtmlBody(lead) {
        const escape = (value) => value
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
        const rows = [
            ['Name', lead.full_name],
            ['Email', lead.email],
            ['Phone', lead.phone],
            ['Visa interest', lead.visa_type],
            ['Source', this.sourceLabel(lead)],
            ['Message', lead.message],
        ];
        const rowsHtml = rows
            .filter(([, value]) => !!value)
            .map(([label, value]) => `
          <tr>
            <td style="padding:8px 16px 8px 0; color:#63645C; font-size:13px; white-space:nowrap; vertical-align:top;">${escape(label)}</td>
            <td style="padding:8px 0; color:#101E36; font-size:14px;">${escape(value)}</td>
          </tr>`)
            .join('');
        const adminUrl = this.adminLeadUrl();
        const ctaHtml = adminUrl
            ? `<a href="${adminUrl}" style="display:inline-block; margin-top:20px; padding:10px 20px; background:#101E36; color:#ffffff; text-decoration:none; border-radius:4px; font-size:14px;">View in admin</a>`
            : `<p style="margin-top:20px; color:#63645C; font-size:13px;">View all leads in the admin panel or via GET /leads.</p>`;
        return `
      <div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif; max-width:520px; margin:0 auto; padding:24px;">
        <p style="font-size:12px; text-transform:uppercase; letter-spacing:0.05em; color:#8B3A2B; font-weight:600; margin:0 0 12px;">New lead</p>
        <table style="width:100%; border-collapse:collapse;">${rowsHtml}</table>
        ${ctaHtml}
      </div>`;
    }
    buildSlackPayload(lead) {
        const adminUrl = this.adminLeadUrl();
        const fields = [
            { type: 'mrkdwn', text: `*Name*\n${lead.full_name}` },
            { type: 'mrkdwn', text: `*Email*\n${lead.email}` },
        ];
        if (lead.phone)
            fields.push({ type: 'mrkdwn', text: `*Phone*\n${lead.phone}` });
        if (lead.visa_type) {
            fields.push({ type: 'mrkdwn', text: `*Visa interest*\n${lead.visa_type}` });
        }
        fields.push({ type: 'mrkdwn', text: `*Source*\n${this.sourceLabel(lead)}` });
        const blocks = [
            {
                type: 'header',
                text: { type: 'plain_text', text: ':tada: New lead', emoji: true },
            },
            { type: 'section', fields },
        ];
        if (lead.message) {
            blocks.push({
                type: 'section',
                text: { type: 'mrkdwn', text: `*Message*\n${lead.message}` },
            });
        }
        if (adminUrl) {
            blocks.push({
                type: 'actions',
                elements: [
                    {
                        type: 'button',
                        text: { type: 'plain_text', text: 'View in admin' },
                        url: adminUrl,
                    },
                ],
            });
        }
        return {
            text: `New lead: ${lead.full_name} (${this.sourceLabel(lead)})`,
            blocks,
        };
    }
};
exports.LeadNotifierService = LeadNotifierService;
exports.LeadNotifierService = LeadNotifierService = LeadNotifierService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], LeadNotifierService);
//# sourceMappingURL=lead-notifier.service.js.map