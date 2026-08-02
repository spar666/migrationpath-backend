import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as nodemailer from 'nodemailer';
import { Prospect } from './entities/prospect.entity';

export interface BookingConfirmedContext {
  scheduledAt?: Date | string | null;
  amountCents?: number | null;
  currency?: string | null;
  recommendedSubclass?: string | null;
  blockers?: string[];
  openQuestions?: string[];
}

/**
 * Alerts the agent when a prospect pays to confirm a consult.
 *
 * Follows the same shape and the same rules as LeadNotifierService: both
 * channels opt-in via env, never throws, never blocks the caller. It is
 * deliberately a separate class rather than a method on LeadNotifierService —
 * the payload is different enough (deep link to the prep view, eligibility
 * summary) that sharing one class would mean a pile of conditionals.
 *
 * Reuses the existing `notifications.*` config keys so there is one place to
 * configure where agent alerts go.
 */
@Injectable()
export class ProspectNotifierService {
  private readonly logger = new Logger(ProspectNotifierService.name);
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

  /**
   * Fired by the Stripe webhook once the consult fee is captured — i.e. the
   * moment the booking becomes real. Deliberately NOT fired on the pending
   * (unpaid) booking: those live in the follow-up queue, and alerting on them
   * would train the agent to ignore the alert.
   */
  async notifyBookingConfirmed(
    prospect: Prospect,
    context: BookingConfirmedContext = {},
  ): Promise<void> {
    const emailConfigured = !!this.transporter;
    const slackConfigured = !!this.configService.get<string>(
      'notifications.slackWebhookUrl',
    );

    if (!emailConfigured && !slackConfigured) {
      if (!this.warnedNoChannelsConfigured) {
        this.logger.warn(
          'A consult was booked and paid for but no notification channel is ' +
            'configured (SMTP_HOST/SMTP_USER/SMTP_PASS or SLACK_LEADS_WEBHOOK_URL). ' +
            'Confirmed bookings are only visible via the admin prospect list ' +
            'until this is set up. (Logged once per server start.)',
        );
        this.warnedNoChannelsConfigured = true;
      }
      return;
    }

    await Promise.allSettled([
      this.sendEmail(prospect, context),
      this.sendSlackMessage(prospect, context),
    ]);
  }

  // -------------------------------------------------------------------------

  /** Deep link straight to the prep view — the point of the alert. */
  private prepUrl(prospect: Prospect): string | null {
    const base = this.configService.get<string>('notifications.adminBaseUrl');
    return base
      ? `${base.replace(/\/$/, '')}/admin/prospects/${prospect.id}`
      : null;
  }

  private formatMoney(
    amountCents?: number | null,
    currency?: string | null,
  ): string | null {
    if (amountCents == null) return null;
    const value = (amountCents / 100).toFixed(2);
    return `${(currency ?? 'AUD').toUpperCase()} $${value}`;
  }

  private formatWhen(scheduledAt?: Date | string | null): string | null {
    if (!scheduledAt) return null;
    const date =
      scheduledAt instanceof Date ? scheduledAt : new Date(scheduledAt);
    if (Number.isNaN(date.getTime())) return null;
    return date.toLocaleString('en-AU', {
      dateStyle: 'full',
      timeStyle: 'short',
      timeZone: 'Australia/Sydney',
    });
  }

  private async sendEmail(
    prospect: Prospect,
    context: BookingConfirmedContext,
  ): Promise<void> {
    if (!this.transporter) return;

    const notifyTo = this.configService.get<string>(
      'notifications.leadNotificationEmail',
    );
    if (!notifyTo) {
      this.logger.warn(
        'SMTP is configured but LEAD_NOTIFICATION_EMAIL is not set — skipping ' +
          'booking confirmation email.',
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
        subject: `Consult booked & paid: ${prospect.full_name} (${prospect.human_ref})`,
        text: this.buildPlainTextBody(prospect, context),
        html: this.buildHtmlBody(prospect, context),
      });
    } catch (error) {
      this.logger.error(
        `Failed to send booking confirmation email: ${(error as Error).message}`,
      );
    }
  }

  private async sendSlackMessage(
    prospect: Prospect,
    context: BookingConfirmedContext,
  ): Promise<void> {
    const webhookUrl = this.configService.get<string>(
      'notifications.slackWebhookUrl',
    );
    if (!webhookUrl) return;

    try {
      await axios.post(webhookUrl, this.buildSlackPayload(prospect, context));
    } catch (error) {
      this.logger.error(
        `Failed to send Slack booking notification: ${(error as Error).message}`,
      );
    }
  }

  private buildPlainTextBody(
    prospect: Prospect,
    context: BookingConfirmedContext,
  ): string {
    const lines = [
      `${prospect.full_name} has paid for and confirmed a consultation.`,
      '',
      `Reference: ${prospect.human_ref}`,
      `Party: ${prospect.party}`,
      `Email: ${prospect.email}`,
    ];
    if (prospect.phone) lines.push(`Phone: ${prospect.phone}`);
    if (prospect.company_name) lines.push(`Business: ${prospect.company_name}`);

    const when = this.formatWhen(context.scheduledAt);
    if (when) lines.push(`Scheduled: ${when} (Sydney time)`);

    const paid = this.formatMoney(context.amountCents, context.currency);
    if (paid) lines.push(`Paid: ${paid}`);

    lines.push(
      `Statutory eligible: ${yesNo(prospect.statutory_eligible)}`,
      `Client fit: ${yesNo(prospect.client_fit)}`,
    );
    if (context.recommendedSubclass) {
      lines.push(`Recommended pathway: subclass ${context.recommendedSubclass}`);
    }
    if (context.blockers?.length) {
      lines.push('', 'Blockers:', ...context.blockers.map((b) => `  - ${b}`));
    }
    if (context.openQuestions?.length) {
      lines.push(
        '',
        'Ask on the call:',
        ...context.openQuestions.map((q) => `  - ${q}`),
      );
    }

    const url = this.prepUrl(prospect);
    lines.push('', url ? `Prep view: ${url}` : 'Open the prospect in the admin panel to prepare.');
    return lines.join('\n');
  }

  private buildHtmlBody(
    prospect: Prospect,
    context: BookingConfirmedContext,
  ): string {
    const escape = (value: string) =>
      value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    const rows: Array<[string, string | undefined | null]> = [
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
      .map(
        ([label, value]) => `
          <tr>
            <td style="padding:8px 16px 8px 0; color:#63645C; font-size:13px; white-space:nowrap; vertical-align:top;">${escape(label)}</td>
            <td style="padding:8px 0; color:#101E36; font-size:14px;">${escape(value as string)}</td>
          </tr>`,
      )
      .join('');

    const listHtml = (title: string, items?: string[]) =>
      items?.length
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

  private buildSlackPayload(
    prospect: Prospect,
    context: BookingConfirmedContext,
  ): Record<string, unknown> {
    const fields: Array<{ type: 'mrkdwn'; text: string }> = [
      { type: 'mrkdwn', text: `*Reference*\n${prospect.human_ref}` },
      { type: 'mrkdwn', text: `*Name*\n${prospect.full_name}` },
      { type: 'mrkdwn', text: `*Email*\n${prospect.email}` },
      { type: 'mrkdwn', text: `*Party*\n${prospect.party}` },
    ];

    const when = this.formatWhen(context.scheduledAt);
    if (when) fields.push({ type: 'mrkdwn', text: `*Scheduled*\n${when}` });

    const paid = this.formatMoney(context.amountCents, context.currency);
    if (paid) fields.push({ type: 'mrkdwn', text: `*Paid*\n${paid}` });

    fields.push({
      type: 'mrkdwn',
      text: `*Eligibility*\nStatutory: ${yesNo(prospect.statutory_eligible)} · Fit: ${yesNo(prospect.client_fit)}`,
    });

    const blocks: Array<Record<string, unknown>> = [
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
}

function yesNo(value: boolean | null | undefined): string {
  if (value === true) return 'Yes';
  if (value === false) return 'No';
  return 'Not screened';
}
