import { ConfigService } from '@nestjs/config';
import { PaymentRepository } from './payment.repository';
import { Payment } from './entities/payment.entity';
import { CreateConsultationCheckoutDto } from './dto/create-checkout.dto';
import { ProspectService } from '../prospect/prospect.service';
import { ConsultationBookingRepository } from '../consultation/consultation.repository';
export declare const STALE_SESSION_MS: number;
export declare class PaymentsService {
    private readonly configService;
    private readonly paymentRepository;
    private readonly prospectService;
    private readonly bookingRepository;
    private readonly logger;
    private readonly stripe;
    constructor(configService: ConfigService, paymentRepository: PaymentRepository, prospectService: ProspectService, bookingRepository: ConsultationBookingRepository);
    createConsultationCheckout(dto: CreateConsultationCheckoutDto): Promise<{
        checkout_url: string;
        payment_id: string;
    }>;
    markPaidFromSession(session: {
        id: string;
        payment_intent?: string | null;
        amount_total?: number | null;
        currency?: string | null;
        metadata?: Record<string, string> | null;
    }): Promise<Payment | null>;
    markSessionUnpaid(sessionId: string, outcome: 'failed' | 'expired'): Promise<Payment | null>;
    reconcileSession(paymentId: string, sessionId: string): Promise<'recovered' | 'expired' | 'open'>;
    private confirmFromReconciliation?;
    setReconciliationConfirmer(confirm: (session: {
        id: string;
        payment_intent?: string | null;
        amount_total?: number | null;
        currency?: string | null;
        metadata?: Record<string, string> | null;
    }) => Promise<void>): void;
    private findByMetadataPaymentId;
    findForProspect(prospectId: string): Promise<Payment[]>;
    private retrieveReusableSession;
    private requireStripe;
}
