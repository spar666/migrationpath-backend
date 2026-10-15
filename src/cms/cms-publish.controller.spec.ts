import { ConfigService } from '@nestjs/config';
import {
  BadGatewayException,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import axios from 'axios';
import { CmsPublishController } from './cms-publish.controller';

jest.mock('axios');
const post = axios.post as jest.Mock;
describe('CMS publish webhook', () => {
  const hook = 'https://api.vercel.com/v1/integrations/deploy/test/hook';
  const create = (values: Record<string, string> = {}) =>
    new CmsPublishController({
      get: (key: string) => values[key],
    } as ConfigService);
  beforeEach(() => jest.clearAllMocks());
  it('fails closed without configured secrets', async () => {
    await expect(
      create().publish('secret', { event: 'entry.publish' }),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
    expect(post).not.toHaveBeenCalled();
  });
  it('rejects invalid credentials before making an external request', async () => {
    const controller = create({
      CMS_PUBLISH_WEBHOOK_SECRET: 'secret',
      VERCEL_DEPLOY_HOOK_URL: hook,
    });
    for (const secret of [undefined, 'short', 'wrong!']) {
      await expect(
        controller.publish(secret, { event: 'entry.publish' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    }
    expect(post).not.toHaveBeenCalled();
  });
  it('queues a rebuild for authenticated unpublishing as well as publishing', async () => {
    post.mockResolvedValue({ status: 200 });
    const controller = create({
      CMS_PUBLISH_WEBHOOK_SECRET: 'secret',
      VERCEL_DEPLOY_HOOK_URL: hook,
    });
    await expect(
      controller.publish('secret', { event: 'entry.unpublish' }),
    ).resolves.toEqual({ queued: true });
    expect(post).toHaveBeenCalledWith(hook, undefined, {
      timeout: 15000,
      maxRedirects: 0,
    });
  });
  it('does not disclose hook credentials on upstream failure', async () => {
    post.mockRejectedValue(new Error(hook));
    const controller = create({
      CMS_PUBLISH_WEBHOOK_SECRET: 'secret',
      VERCEL_DEPLOY_HOOK_URL: hook,
    });
    await expect(
      controller.publish('secret', { event: 'entry.publish' }),
    ).rejects.toBeInstanceOf(BadGatewayException);
  });
});
