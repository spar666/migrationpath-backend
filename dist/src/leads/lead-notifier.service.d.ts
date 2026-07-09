import { ConfigService } from '@nestjs/config';
import { Lead } from './entities/lead.entity';
export declare class LeadNotifierService {
    private readonly configService;
    private readonly logger;
    private transporter;
    private warnedNoChannelsConfigured;
    constructor(configService: ConfigService);
    notifyNewLead(lead: Lead): Promise<void>;
    private adminLeadUrl;
    private sourceLabel;
    private sendEmail;
    private sendSlackMessage;
    private buildPlainTextBody;
    private buildHtmlBody;
    private buildSlackPayload;
}
