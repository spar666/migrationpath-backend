import { ConfigService } from '@nestjs/config';
import { Prospect } from './entities/prospect.entity';
export interface BookingConfirmedContext {
    scheduledAt?: Date | string | null;
    amountCents?: number | null;
    currency?: string | null;
    recommendedSubclass?: string | null;
    blockers?: string[];
    openQuestions?: string[];
}
export declare class ProspectNotifierService {
    private readonly configService;
    private readonly logger;
    private transporter;
    private warnedNoChannelsConfigured;
    constructor(configService: ConfigService);
    notifyBookingConfirmed(prospect: Prospect, context?: BookingConfirmedContext): Promise<void>;
    private prepUrl;
    private formatMoney;
    private formatWhen;
    private sendEmail;
    private sendSlackMessage;
    private buildPlainTextBody;
    private buildHtmlBody;
    private buildSlackPayload;
}
