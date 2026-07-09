import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as nodemailer from 'nodemailer';
import { LeadNotifierService } from './lead-notifier.service';
import { Lead } from './entities/lead.entity';

jest.mock('axios');
jest.mock('nodemailer');

const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockedNodemailer = nodemailer as jest.Mocked<typeof nodemailer>;

describe('LeadNotifierService', () => {
  const baseLead: Lead = {
    id: 'lead-1',
    full_name: 'Jane Doe',
    email: 'jane@example.com',
    phone: '+61400000000',
    visa_type: 'skilled-189',
    message: 'Interested in skilled migration',
    package_id: undefined,
    source: 'quote_slideover',
    status: 'new',
    created_at: new Date(),
    updated_at: new Date(),
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  async function buildService(configValues: Record<string, any>) {
    const configService = {
      get: jest.fn((key: string) => configValues[key]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeadNotifierService,
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    return module.get<LeadNotifierService>(LeadNotifierService);
  }

  it('does not throw and takes no action when no channel is configured', async () => {
    const service = await buildService({});

    await expect(service.notifyNewLead(baseLead)).resolves.toBeUndefined();
    expect(mockedAxios.post).not.toHaveBeenCalled();
  });

  it('sends a Slack message when a webhook URL is configured', async () => {
    mockedAxios.post.mockResolvedValue({ data: 'ok' });

    const service = await buildService({
      'notifications.slackWebhookUrl': 'https://hooks.slack.com/services/test',
    });

    await service.notifyNewLead(baseLead);

    expect(mockedAxios.post).toHaveBeenCalledWith(
      'https://hooks.slack.com/services/test',
      expect.objectContaining({
        text: expect.stringContaining('Jane Doe'),
      }),
    );
  });

  it('includes an admin link as a Slack action button when ADMIN_BASE_URL is set', async () => {
    mockedAxios.post.mockResolvedValue({ data: 'ok' });

    const service = await buildService({
      'notifications.slackWebhookUrl': 'https://hooks.slack.com/services/test',
      'notifications.adminBaseUrl': 'https://app.example.com',
    });

    await service.notifyNewLead(baseLead);

    const [, payload] = mockedAxios.post.mock.calls[0];
    const blocks = (payload as any).blocks as Array<Record<string, any>>;
    const actionsBlock = blocks.find((b) => b.type === 'actions');
    expect(actionsBlock?.elements?.[0]?.url).toBe('https://app.example.com/admin/leads');
  });

  it('does not fail the caller when the Slack webhook request fails', async () => {
    mockedAxios.post.mockRejectedValue(new Error('network error'));

    const service = await buildService({
      'notifications.slackWebhookUrl': 'https://hooks.slack.com/services/test',
    });

    await expect(service.notifyNewLead(baseLead)).resolves.toBeUndefined();
  });

  it('sends an email when SMTP and a notification address are configured', async () => {
    const sendMail = jest.fn().mockResolvedValue({ messageId: '123' });
    mockedNodemailer.createTransport.mockReturnValue({ sendMail } as any);

    const service = await buildService({
      'notifications.smtp': {
        host: 'smtp.example.com',
        port: 587,
        user: 'user',
        pass: 'pass',
      },
      'notifications.leadNotificationEmail': 'sales@example.com',
    });

    await service.notifyNewLead(baseLead);

    expect(sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'sales@example.com',
        subject: expect.stringContaining('Jane Doe'),
        html: expect.stringContaining('Jane Doe'),
      }),
    );
  });

  it('skips email silently if SMTP is configured but no notification address is set', async () => {
    const sendMail = jest.fn();
    mockedNodemailer.createTransport.mockReturnValue({ sendMail } as any);

    const service = await buildService({
      'notifications.smtp': {
        host: 'smtp.example.com',
        port: 587,
        user: 'user',
        pass: 'pass',
      },
      // LEAD_NOTIFICATION_EMAIL intentionally omitted
    });

    await service.notifyNewLead(baseLead);

    expect(sendMail).not.toHaveBeenCalled();
  });

  it('does not fail the caller when sending email throws', async () => {
    const sendMail = jest.fn().mockRejectedValue(new Error('SMTP auth failed'));
    mockedNodemailer.createTransport.mockReturnValue({ sendMail } as any);

    const service = await buildService({
      'notifications.smtp': {
        host: 'smtp.example.com',
        port: 587,
        user: 'user',
        pass: 'pass',
      },
      'notifications.leadNotificationEmail': 'sales@example.com',
    });

    await expect(service.notifyNewLead(baseLead)).resolves.toBeUndefined();
  });
});
