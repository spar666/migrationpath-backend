import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as nodemailer from 'nodemailer';
import { Lead } from './entities/lead.entity';

const SOURCE_LABELS: Record<string, string> = {
  quote_slideover: 'Header quick quote',
  quote_page: 'Quote page',
  other: 'Other',
};

/**
 * Fires notifications when a new lead is captured.
 *
 * Both channels are entirely opt-in via environment variables. If neither
 * is configured, this service logs a warning once and no-ops — it will
 * never throw, and it will never block or fail lead creation. See
 * .env.example for the variables this reads.
 */
@Injectable()
export class LeadNotifierService {
  private readonly logger = new Logger(LeadNotifierService.name);
  private transporter: nodemailer.Transporter | null = null;
  private warnedNoChannelsConfigured = false;

  constructor(private readonly configService: ConfigService) {
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

  async notifyNewLead(lead: Lead): Promise<void> {
    const emailConfigured = !!this.transporter;
    const slackConfigured = !!this.configService.get<string>(
      'notifications.slackWebhookUrl',
    );

    if (!emailConfigured && !slackConfigured) {
      if (!this.warnedNoChannelsConfigured) {
        this.logger.warn(
          'New lead captured but no notification channel is configured ' +
            '(SMTP_HOST/SMTP_USER/SMTP_PASS or SLACK_LEADS_WEBHOOK_URL). ' +
            'Leads are only visible via GET /leads until this is set up. ' +
            '(This warning is logged once per server start.)',
        );
        this.warnedNoChannelsConfigured = true;
      }
      return;
    }

    // Run both channels independently — one failing must never affect the
    // other, and neither must ever propagate back to the caller.
    await Promise.allSettled([
      this.sendEmail(lead),
      this.sendSlackMessage(lead),
    ]);
  }

  private adminLeadUrl(): string | null {
    const base = this.configService.get<string>('notifications.adminBaseUrl');
    return base ? `${base.replace(/\/$/, '')}/admin/leads` : null;
  }

  private sourceLabel(lead: Lead): string {
    return SOURCE_LABELS[lead.source] ?? lead.source;
  }

  private async sendEmail(lead: Lead): Promise<void> {
    if (!this.transporter) return;

    const notifyTo = this.configService.get<string>(
      'notifications.leadNotificationEmail',
    );
    if (!notifyTo) {
      this.logger.warn(
        'SMTP is configured but LEAD_NOTIFICATION_EMAIL is not set — skipping email notification.',
      );
      return;
    }

    const fromAddress =
      this.configService.get<string>('notifications.smtp.from') ||
      this.configService.get<string>('notifications.smtp.user');

    try {
      await this.transporter.sendMail({
        from: fromAddress,
        to: notifyTo,
        subject: `New lead: ${lead.full_name} (${this.sourceLabel(lead)})`,
        text: this.buildPlainTextBody(lead),
        html: this.buildHtmlBody(lead),
      });
    } catch (error) {
      this.logger.error(
        `Failed to send lead notification email: ${(error as Error).message}`,
      );
    }
  }

  private async sendSlackMessage(lead: Lead): Promise<void> {
    const webhookUrl = this.configService.get<string>(
      'notifications.slackWebhookUrl',
    );
    if (!webhookUrl) return;

    try {
      await axios.post(webhookUrl, this.buildSlackPayload(lead));
    } catch (error) {
      this.logger.error(
        `Failed to send Slack lead notification: ${(error as Error).message}`,
      );
    }
  }

  private buildPlainTextBody(lead: Lead): string {
    const lines = [
      `A new lead was just captured on the site (source: ${this.sourceLabel(lead)}).`,
      '',
      `Name: ${lead.full_name}`,
      `Email: ${lead.email}`,
    ];
    if (lead.phone) lines.push(`Phone: ${lead.phone}`);
    if (lead.visa_type) lines.push(`Visa interest: ${lead.visa_type}`);
    if (lead.message) lines.push(`Message: ${lead.message}`);
    const adminUrl = this.adminLeadUrl();
    lines.push(
      '',
      adminUrl
        ? `View all leads: ${adminUrl}`
        : 'View all leads in the admin panel or via GET /leads.',
    );
    return lines.join('\n');
  }

  private buildHtmlBody(lead: Lead): string {
    const escape = (value: string) =>
      value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

    const rows: Array<[string, string | undefined]> = [
      ['Name', lead.full_name],
      ['Email', lead.email],
      ['Phone', lead.phone],
      ['Visa interest', lead.visa_type],
      ['Source', this.sourceLabel(lead)],
      ['Message', lead.message],
    ];

    const rowsHtml = rows
      .filter(([, value]) => !!value)
      .map(
        ([label, value]) => `
          <tr>
            <td style="padding:8px 16px 8px 0; color:#63645C; font-size:13px; white-space:nowrap; vertical-align:top;">${escape(label)}</td>
            <td style="padding:8px 0; color:#101E36; font-size:14px;">${escape(value as string)}</td>
          </tr>`,
      )
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

  private buildSlackPayload(lead: Lead): Record<string, unknown> {
    const adminUrl = this.adminLeadUrl();

    const fields: Array<{ type: 'mrkdwn'; text: string }> = [
      { type: 'mrkdwn', text: `*Name*\n${lead.full_name}` },
      { type: 'mrkdwn', text: `*Email*\n${lead.email}` },
    ];
    if (lead.phone) fields.push({ type: 'mrkdwn', text: `*Phone*\n${lead.phone}` });
    if (lead.visa_type) {
      fields.push({ type: 'mrkdwn', text: `*Visa interest*\n${lead.visa_type}` });
    }
    fields.push({ type: 'mrkdwn', text: `*Source*\n${this.sourceLabel(lead)}` });

    const blocks: Array<Record<string, unknown>> = [
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
      // `text` is a required fallback for notifications/screen readers —
      // Slack renders `blocks` when present but still needs this.
      text: `New lead: ${lead.full_name} (${this.sourceLabel(lead)})`,
      blocks,
    };
  }
}
