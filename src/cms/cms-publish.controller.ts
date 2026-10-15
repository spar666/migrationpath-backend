import {
  Body,
  Controller,
  Headers,
  HttpCode,
  Post,
  ServiceUnavailableException,
  UnauthorizedException,
  BadGatewayException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { timingSafeEqual } from 'node:crypto';
import axios from 'axios';
import { IsIn } from 'class-validator';

export class CmsPublishEventDto {
  @IsIn(['entry.publish', 'entry.unpublish', 'entry.delete', 'entry.update'])
  event: string;
}

@Controller('cms/webhooks')
export class CmsPublishController {
  constructor(private readonly config: ConfigService) {}

  @Post('publish')
  @HttpCode(202)
  async publish(
    @Headers('x-cms-webhook-secret') suppliedSecret: string | undefined,
    @Body() event: CmsPublishEventDto,
  ) {
    const secret = this.config.get<string>('CMS_PUBLISH_WEBHOOK_SECRET');
    const deployHook = this.config.get<string>('VERCEL_DEPLOY_HOOK_URL');
    if (!secret || !deployHook)
      throw new ServiceUnavailableException('CMS publishing is not configured');
    const supplied = Buffer.from(suppliedSecret || '');
    const expected = Buffer.from(secret);
    if (
      supplied.length !== expected.length ||
      !timingSafeEqual(supplied, expected)
    ) {
      throw new UnauthorizedException('Invalid CMS webhook credentials');
    }
    if (
      ![
        'entry.publish',
        'entry.unpublish',
        'entry.delete',
        'entry.update',
      ].includes(event.event)
    ) {
      throw new BadRequestException('Unsupported CMS event');
    }
    // Only a server-configured Vercel deploy hook can be called; no URL from
    // the request is ever used. Hook secrets must not appear in error logs.
    const url = new URL(deployHook);
    if (
      url.origin !== 'https://api.vercel.com' ||
      !url.pathname.startsWith('/v1/integrations/deploy/')
    ) {
      throw new ServiceUnavailableException(
        'Invalid deployment hook configuration',
      );
    }
    try {
      await axios.post(deployHook, undefined, {
        timeout: 15000,
        maxRedirects: 0,
      });
    } catch {
      throw new BadGatewayException(
        'Content rebuild could not be queued; retry the webhook',
      );
    }
    return { queued: true };
  }
}
