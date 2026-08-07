import { OnModuleInit } from '@nestjs/common';
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
export declare class WebhooksService implements OnModuleInit {
    private readonly webhookEventRepository;
    private readonly prospectService;
    private readonly summaryService;
    private readonly notifier;
    private readonly paymentsService;
    private readonly bookingRepository;
    private readonly logger;
    constructor(webhookEventRepository: WebhookEventRepository, prospectService: ProspectService, summaryService: ProspectSummaryService, notifier: ProspectNotifierService, paymentsService: PaymentsService, bookingRepository: ConsultationBookingRepository);
    onModuleInit(): void;
    verifyCalendlySignature(rawBody: Buffer, signatureHeader: string | undefined, signingKey: string, toleranceSeconds?: number): boolean;
    mapCalendlyInvitee(payload: unknown): CalendlyInvitee | null;
    handleCalendlyInviteeCreated(invitee: CalendlyInvitee): Promise<void>;
    private adoptClientReportedBooking;
    handleCalendlyInviteeCanceled(invitee: CalendlyInvitee): Promise<void>;
    handleStripeCheckoutCompleted(session: {
        id: string;
        payment_intent?: string | null;
        amount_total?: number | null;
        currency?: string | null;
        metadata?: Record<string, string> | null;
    }): Promise<void>;
    handleStripeSessionUnpaid(sessionId: string, outcome: 'failed' | 'expired'): Promise<void>;
    processOnce(provider: 'calendly' | 'stripe', externalId: string, eventType: string, payload: Record<string, any>, handler: () => Promise<void>): Promise<boolean>;
    private findProspectIdInQuestions;
}
