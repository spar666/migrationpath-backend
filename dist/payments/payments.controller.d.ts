import { PaymentsService } from './payments.service';
import { CreateConsultationCheckoutDto } from './dto/create-checkout.dto';
export declare class PaymentsController {
    private readonly paymentsService;
    constructor(paymentsService: PaymentsService);
    createConsultationCheckout(dto: CreateConsultationCheckoutDto): Promise<{
        checkout_url: string;
        payment_id: string;
    }>;
    findForProspect(prospectId: string): Promise<import("./entities/payment.entity").Payment[]>;
}
