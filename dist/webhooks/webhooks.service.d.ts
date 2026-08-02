import { WebhookEventRepository } from './webhook-event.repository';
import { ProspectService } from '../prospect/prospect.service';
import { ProspectSummaryService } from '../prospect/prospect-summary.service';
import { ProspectNotifierService } from '../prospect/prospect-notifier.service';
import { PaymentsService } from '../payments/payments.service';
import { ConsultationBookingRepository } from '../consultation/consultation.repository';
export interface CalendlyInvitee {
    inviteeUri: string;
    scheduledEventUri?: string;
    email?: string;
    name?: string;
    startsAt?: string;
    endsAt?: string;
    joinUrl?: string;
    rescheduleUrl?: string;
    cancelUrl?: string;
    cancellationReason?: string;
    prospectId?: string;
}
export declare class WebhooksService {
    private readonly webhookEventRepository;
    private readonly prospectService;
    private readonly summaryService;
    private readonly notifier;
    private readonly paymentsService;
    private readonly bookingRepository;
    private readonly logger;
    constructor(webhookEventRepository: WebhookEventRepository, prospectService: ProspectService, summaryService: ProspectSummaryService, notifier: ProspectNotifierService, paymentsService: PaymentsService, bookingRepository: ConsultationBookingRepository);
    verifyCalendlySignature(rawBody: Buffer, signatureHeader: string | undefined, signingKey: string, toleranceSeconds?: number): boolean;
    mapCalendlyInvitee(payload: Record<string, any>): CalendlyInvitee | null;
    handleCalendlyInviteeCreated(invitee: CalendlyInvitee): Promise<void>;
    handleCalendlyInviteeCanceled(invitee: CalendlyInvitee): Promise<void>;
    handleStripeCheckoutCompleted(session: {
        id: string;
        payment_intent?: string | null;
        amount_total?: number | null;
        currency?: string | null;
        metadata?: Record<string, string> | null;
    }): Promise<void>;
    processOnce(provider: 'calendly' | 'stripe', externalId: string, eventType: string, payload: Record<string, any>, handler: () => Promise<void>): Promise<boolean>;
    private findProspectIdInQuestions;
}
