import { PaymentsService } from './payments.service';
import { PaymentReconciliationService } from './payment-reconciliation.service';
import { CreateConsultationCheckoutDto } from './dto/create-checkout.dto';
export declare class PaymentsController {
    private readonly paymentsService;
    private readonly reconciliationService;
    constructor(paymentsService: PaymentsService, reconciliationService: PaymentReconciliationService);
    createConsultationCheckout(dto: CreateConsultationCheckoutDto): Promise<{
        checkout_url: string;
        payment_id: string;
    }>;
    findForProspect(prospectId: string): Promise<import("./entities/payment.entity").Payment[]>;
    reconcile(): Promise<{
        checked: number;
        recovered: number;
        expired: number;
    }>;
}
