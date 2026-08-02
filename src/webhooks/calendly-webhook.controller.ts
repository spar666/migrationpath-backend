import {
  BadRequestException,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SkipThrottle } from '@nestjs/throttler';
import { ApiExcludeController } from '@nestjs/swagger';
import type { RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';
import { WebhooksService } from './webhooks.service';

/**
 * Calendly → POST /api/v1/webhooks/calendly
 * Subscribe to: invitee.created, invitee.canceled
 *
 * Not in Swagger: it is not a client-facing API and publishing its shape only
 * helps someone craft a forgery.
 *
 * Not throttled: the global ThrottlerGuard counts per IP, and Calendly
 * delivers every event from a small set of IPs. Under load — exactly when
 * bookings matter most — the throttle would start rejecting real events, and a
 * rejected webhook is a lost booking. Signature verification is what protects
 * this endpoint, not rate limiting.
 */
@ApiExcludeController()
@SkipThrottle()
@Controller('webhooks/calendly')
export class CalendlyWebhookController {
  private readonly logger = new Logger(CalendlyWebhookController.name);

  constructor(
    private readonly webhooksService: WebhooksService,
    private readonly configService: ConfigService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async handle(
    @Req() request: RawBodyRequest<Request>,
    @Headers('calendly-webhook-signature') signature?: string,
  ) {
    const signingKey = this.configService.get<string>(
      'integrations.calendly.signingKey',
    );

    // Fail closed. An unverifiable webhook endpoint that accepts anything is
    // an open door to fabricated bookings, so a missing key disables the
    // endpoint rather than turning verification off.
    if (!signingKey) {
      this.logger.error(
        'CALENDLY_WEBHOOK_SIGNING_KEY is not set — rejecting webhook.',
      );
      throw new UnauthorizedException();
    }

    // Requires `rawBody: true` in main.ts. The signature covers the exact
    // bytes Calendly sent; JSON.parse + re-stringify does not round-trip
    // (key order, unicode escapes, whitespace), so the parsed body is useless
    // for verification.
    const rawBody = request.rawBody;
    if (!rawBody) {
      this.logger.error(
        'Raw body unavailable — is NestFactory.create called with { rawBody: true }?',
      );
      throw new BadRequestException('Raw body required');
    }

    if (
      !this.webhooksService.verifyCalendlySignature(
        rawBody,
        signature,
        signingKey,
      )
    ) {
      this.logger.warn('Rejected Calendly webhook: invalid signature');
      throw new UnauthorizedException();
    }

    const payload = JSON.parse(rawBody.toString('utf8'));
    const eventType: string = payload?.event ?? 'unknown';

    const invitee = this.webhooksService.mapCalendlyInvitee(payload);
    if (!invitee) {
      // 200, not 4xx: the signature was valid, so this is our problem, not
      // Calendly's. Returning an error would make them retry a payload we
      // will fail to parse every time.
      this.logger.error(
        `Calendly ${eventType} payload could not be mapped to an invitee`,
      );
      return { received: true, handled: false };
    }

    // Calendly does not send a stable event id, so the invitee URI plus the
    // event name is the idempotency key: the same invitee legitimately
    // produces both a created and a canceled event.
    const externalId = `${invitee.inviteeUri}#${eventType}`;

    const handled = await this.webhooksService.processOnce(
      'calendly',
      externalId,
      eventType,
      payload,
      async () => {
        switch (eventType) {
          case 'invitee.created':
            await this.webhooksService.handleCalendlyInviteeCreated(invitee);
            break;
          case 'invitee.canceled':
            await this.webhooksService.handleCalendlyInviteeCanceled(invitee);
            break;
          default:
            this.logger.log(`Ignoring unhandled Calendly event: ${eventType}`);
        }
      },
    );

    return { received: true, handled };
  }
}
