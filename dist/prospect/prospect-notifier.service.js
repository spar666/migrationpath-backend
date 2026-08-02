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
var ProspectNotifierService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProspectNotifierService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_1 = __importDefault(require("axios"));
const nodemailer = __importStar(require("nodemailer"));
let ProspectNotifierService = ProspectNotifierService_1 = class ProspectNotifierService {
    configService;
    logger = new common_1.Logger(ProspectNotifierService_1.name);
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
    async notifyBookingConfirmed(prospect, context = {}) {
        const emailConfigured = !!this.transporter;
        const slackConfigured = !!this.configService.get('notifications.slackWebhookUrl');
        if (!emailConfigured && !slackConfigured) {
            if (!this.warnedNoChannelsConfigured) {
                this.logger.warn('A consult was booked and paid for but no notification channel is ' +
                    'configured (SMTP_HOST/SMTP_USER/SMTP_PASS or SLACK_LEADS_WEBHOOK_URL). ' +
                    'Confirmed bookings are only visible via the admin prospect list ' +
                    'until this is set up. (Logged once per server start.)');
                this.warnedNoChannelsConfigured = true;
            }
            return;
        }
        await Promise.allSettled([
            this.sendEmail(prospect, context),
            this.sendSlackMessage(prospect, context),
        ]);
    }
    prepUrl(prospect) {
        const base = this.configService.get('notifications.adminBaseUrl');
        return base
            ? `${base.replace(/\/$/, '')}/admin/prospects/${prospect.id}`
            : null;
    }
    formatMoney(amountCents, currency) {
        if (amountCents == null)
            return null;
        const value = (amountCents / 100).toFixed(2);
        return `${(currency ?? 'AUD').toUpperCase()} $${value}`;
    }
    formatWhen(scheduledAt) {
        if (!scheduledAt)
            return null;
        const date = scheduledAt instanceof Date ? scheduledAt : new Date(scheduledAt);
        if (Number.isNaN(date.getTime()))
            return null;
        return date.toLocaleString('en-AU', {
            dateStyle: 'full',
            timeStyle: 'short',
            timeZone: 'Australia/Sydney',
        });
    }
    async sendEmail(prospect, context) {
        if (!this.transporter)
            return;
        const notifyTo = this.configService.get('notifications.leadNotificationEmail');
        if (!notifyTo) {
            this.logger.warn('SMTP is configured but LEAD_NOTIFICATION_EMAIL is not set — skipping ' +
                'booking confirmation email.');
            return;
        }
        const fromAddress = this.configService.get('notifications.smtp.from') ||
            this.configService.get('notifications.smtp.user');
        try {
            await this.transporter.sendMail({
                from: fromAddress,
                to: notifyTo,
                subject: `Consult booked & paid: ${prospect.full_name} (${prospect.human_ref})`,
                text: this.buildPlainTextBody(prospect, context),
                html: this.buildHtmlBody(prospect, context),
            });
        }
        catch (error) {
            this.logger.error(`Failed to send booking confirmation email: ${error.message}`);
        }
    }
    async sendSlackMessage(prospect, context) {
        const webhookUrl = this.configService.get('notifications.slackWebhookUrl');
        if (!webhookUrl)
            return;
        try {
            await axios_1.default.post(webhookUrl, this.buildSlackPayload(prospect, context));
        }
        catch (error) {
            this.logger.error(`Failed to send Slack booking notification: ${error.message}`);
        }
    }
    buildPlainTextBody(prospect, context) {
        const lines = [
            `${prospect.full_name} has paid for and confirmed a consultation.`,
            '',
            `Reference: ${prospect.human_ref}`,
            `Party: ${prospect.party}`,
            `Email: ${prospect.email}`,
        ];
        if (prospect.phone)
            lines.push(`Phone: ${prospect.phone}`);
        if (prospect.company_name)
            lines.push(`Business: ${prospect.company_name}`);
        const when = this.formatWhen(context.scheduledAt);
        if (when)
            lines.push(`Scheduled: ${when} (Sydney time)`);
        const paid = this.formatMoney(context.amountCents, context.currency);
        if (paid)
            lines.push(`Paid: ${paid}`);
        lines.push(`Statutory eligible: ${yesNo(prospect.statutory_eligible)}`, `Client fit: ${yesNo(prospect.client_fit)}`);
        if (context.recommendedSubclass) {
            lines.push(`Recommended pathway: subclass ${context.recommendedSubclass}`);
        }
        if (context.blockers?.length) {
            lines.push('', 'Blockers:', ...context.blockers.map((b) => `  - ${b}`));
        }
        if (context.openQuestions?.length) {
            lines.push('', 'Ask on the call:', ...context.openQuestions.map((q) => `  - ${q}`));
        }
        const url = this.prepUrl(prospect);
        lines.push('', url ? `Prep view: ${url}` : 'Open the prospect in the admin panel to prepare.');
        return lines.join('\n');
    }
    buildHtmlBody(prospect, context) {
        const escape = (value) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        const rows = [
            ['Reference', prospect.human_ref],
            ['Name', prospect.full_name],
            ['Email', prospect.email],
            ['Phone', prospect.phone],
            ['Business', prospect.company_name],
            ['Party', prospect.party],
            ['Scheduled', this.formatWhen(context.scheduledAt)],
            ['Paid', this.formatMoney(context.amountCents, context.currency)],
            ['Statutory eligible', yesNo(prospect.statutory_eligible)],
            ['Client fit', yesNo(prospect.client_fit)],
            [
                'Recommended pathway',
                context.recommendedSubclass
                    ? `Subclass ${context.recommendedSubclass}`
                    : undefined,
            ],
        ];
        const rowsHtml = rows
            .filter(([, value]) => !!value)
            .map(([label, value]) => `
          <tr>
            <td style="padding:8px 16px 8px 0; color:#63645C; font-size:13px; white-space:nowrap; vertical-align:top;">${escape(label)}</td>
            <td style="padding:8px 0; color:#101E36; font-size:14px;">${escape(value)}</td>
          </tr>`)
            .join('');
        const listHtml = (title, items) => items?.length
            ? `<p style="margin:20px 0 4px; font-size:13px; color:#63645C; font-weight:600;">${escape(title)}</p>
           <ul style="margin:0; padding-left:18px; color:#101E36; font-size:14px;">
             ${items.map((i) => `<li style="margin:4px 0;">${escape(i)}</li>`).join('')}
           </ul>`
            : '';
        const url = this.prepUrl(prospect);
        const ctaHtml = url
            ? `<a href="${url}" style="display:inline-block; margin-top:20px; padding:10px 20px; background:#101E36; color:#ffffff; text-decoration:none; border-radius:4px; font-size:14px;">Open prep view</a>`
            : `<p style="margin-top:20px; color:#63645C; font-size:13px;">Open the prospect in the admin panel to prepare.</p>`;
        return `
      <div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif; max-width:560px; margin:0 auto; padding:24px;">
        <p style="font-size:12px; text-transform:uppercase; letter-spacing:0.05em; color:#8B3A2B; font-weight:600; margin:0 0 12px;">Consult booked &amp; paid</p>
        <table style="width:100%; border-collapse:collapse;">${rowsHtml}</table>
        ${listHtml('Blockers', context.blockers)}
        ${listHtml('Ask on the call', context.openQuestions)}
        ${ctaHtml}
      </div>`;
    }
    buildSlackPayload(prospect, context) {
        const fields = [
            { type: 'mrkdwn', text: `*Reference*\n${prospect.human_ref}` },
            { type: 'mrkdwn', text: `*Name*\n${prospect.full_name}` },
            { type: 'mrkdwn', text: `*Email*\n${prospect.email}` },
            { type: 'mrkdwn', text: `*Party*\n${prospect.party}` },
        ];
        const when = this.formatWhen(context.scheduledAt);
        if (when)
            fields.push({ type: 'mrkdwn', text: `*Scheduled*\n${when}` });
        const paid = this.formatMoney(context.amountCents, context.currency);
        if (paid)
            fields.push({ type: 'mrkdwn', text: `*Paid*\n${paid}` });
        fields.push({
            type: 'mrkdwn',
            text: `*Eligibility*\nStatutory: ${yesNo(prospect.statutory_eligible)} · Fit: ${yesNo(prospect.client_fit)}`,
        });
        const blocks = [
            {
                type: 'header',
                text: {
                    type: 'plain_text',
                    text: ':calendar: Consult booked & paid',
                    emoji: true,
                },
            },
            { type: 'section', fields },
        ];
        if (context.blockers?.length) {
            blocks.push({
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: `*Blockers*\n${context.blockers.map((b) => `• ${b}`).join('\n')}`,
                },
            });
        }
        if (context.openQuestions?.length) {
            blocks.push({
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: `*Ask on the call*\n${context.openQuestions.map((q) => `• ${q}`).join('\n')}`,
                },
            });
        }
        const url = this.prepUrl(prospect);
        if (url) {
            blocks.push({
                type: 'actions',
                elements: [
                    {
                        type: 'button',
                        text: { type: 'plain_text', text: 'Open prep view' },
                        url,
                    },
                ],
            });
        }
        return {
            text: `Consult booked & paid: ${prospect.full_name} (${prospect.human_ref})`,
            blocks,
        };
    }
};
exports.ProspectNotifierService = ProspectNotifierService;
exports.ProspectNotifierService = ProspectNotifierService = ProspectNotifierService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], ProspectNotifierService);
function yesNo(value) {
    if (value === true)
        return 'Yes';
    if (value === false)
        return 'No';
    return 'Not screened';
}
//# sourceMappingURL=prospect-notifier.service.js.map