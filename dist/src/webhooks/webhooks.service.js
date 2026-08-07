"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var WebhooksService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhooksService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const webhook_event_repository_1 = require("./webhook-event.repository");
const prospect_service_1 = require("../prospect/prospect.service");
const prospect_summary_service_1 = require("../prospect/prospect-summary.service");
const prospect_notifier_service_1 = require("../prospect/prospect-notifier.service");
const payments_service_1 = require("../payments/payments.service");
const consultation_repository_1 = require("../consultation/consultation.repository");
function asRecord(value) {
    return typeof value === 'object' && value !== null
        ? value
        : {};
}
function str(value) {
    return typeof value === 'string' && value.length > 0 ? value : undefined;
}
function strList(value) {
    return Array.isArray(value)
        ? value.filter((entry) => typeof entry === 'string')
        : [];
}
let WebhooksService = WebhooksService_1 = class WebhooksService {
    webhookEventRepository;
    prospectService;
    summaryService;
    notifier;
    paymentsService;
    bookingRepository;
    logger = new common_1.Logger(WebhooksService_1.name);
    constructor(webhookEventRepository, prospectService, summaryService, notifier, paymentsService, bookingRepository) {
        this.webhookEventRepository = webhookEventRepository;
        this.prospectService = prospectService;
        this.summaryService = summaryService;
        this.notifier = notifier;
        this.paymentsService = paymentsService;
        this.bookingRepository = bookingRepository;
    }
    onModuleInit() {
        this.paymentsService.setReconciliationConfirmer((session) => this.handleStripeCheckoutCompleted(session));
    }
    verifyCalendlySignature(rawBody, signatureHeader, signingKey, toleranceSeconds = 300) {
        if (!signatureHeader)
            return false;
        const parts = Object.fromEntries(signatureHeader
            .split(',')
            .map((part) => part.trim().split('=', 2))
            .filter((pair) => pair.length === 2));
        const timestamp = parts['t'];
        const provided = parts['v1'];
        if (!timestamp || !provided)
            return false;
        const age = Math.abs(Date.now() / 1000 - Number(timestamp));
        if (!Number.isFinite(age) || age > toleranceSeconds) {
            this.logger.warn('Rejected Calendly webhook: signature timestamp outside tolerance');
            return false;
        }
        const expected = (0, crypto_1.createHmac)('sha256', signingKey)
            .update(`${timestamp}.${rawBody.toString('utf8')}`)
            .digest('hex');
        return safeEqualHex(expected, provided);
    }
    mapCalendlyInvitee(payload) {
        const root = asRecord(payload);
        const invitee = 'payload' in root ? asRecord(root.payload) : root;
        const inviteeUri = str(invitee.uri) ?? str(asRecord(invitee.invitee).uri);
        if (!inviteeUri)
            return null;
        const scheduledEvent = asRecord(invitee.scheduled_event);
        const location = asRecord(scheduledEvent.location);
        const tracking = asRecord(invitee.tracking);
        const prospectId = str(tracking.utm_content) ??
            str(tracking.utm_campaign) ??
            str(tracking.salesforce_uuid) ??
            this.findProspectIdInQuestions(invitee.questions_and_answers);
        return {
            inviteeUri,
            scheduledEventUri: str(scheduledEvent.uri),
            email: str(invitee.email),
            name: str(invitee.name),
            startsAt: str(scheduledEvent.start_time),
            endsAt: str(scheduledEvent.end_time),
            joinUrl: str(location.join_url) ?? str(location.location),
            rescheduleUrl: str(invitee.reschedule_url),
            cancelUrl: str(invitee.cancel_url),
            cancellationReason: str(asRecord(invitee.cancellation).reason),
            prospectId,
        };
    }
    async handleCalendlyInviteeCreated(invitee) {
        const existing = await this.bookingRepository.findBySchedulerEventId(invitee.inviteeUri);
        if (existing) {
            if (existing.client_reported_at) {
                await this.adoptClientReportedBooking(existing.id, invitee);
                return;
            }
            this.logger.log(`Calendly invitee ${invitee.inviteeUri} already has a booking — skipping`);
            return;
        }
        if (invitee.prospectId) {
            const clientReported = await this.bookingRepository.findClientReportedForProspect(invitee.prospectId);
            if (clientReported) {
                await this.adoptClientReportedBooking(clientReported.id, invitee);
                return;
            }
        }
        if (!invitee.prospectId) {
            this.logger.error(`Calendly invitee ${invitee.inviteeUri} arrived with no prospect_id — ` +
                `check that openScheduler() is still passing it. Booking recorded unlinked.`);
        }
        const booking = await this.bookingRepository.create({
            prospect_id: invitee.prospectId ?? null,
            user_id: null,
            status: 'pending',
            scheduler_provider: 'calendly',
            scheduler_event_id: invitee.inviteeUri,
            scheduler_invitee_id: invitee.scheduledEventUri,
            invitee_email: invitee.email ?? null,
            invitee_name: invitee.name ?? null,
            scheduled_at: invitee.startsAt ? new Date(invitee.startsAt) : null,
            scheduled_end_at: invitee.endsAt ? new Date(invitee.endsAt) : null,
            join_url: invitee.joinUrl ?? null,
            reschedule_url: invitee.rescheduleUrl ?? null,
            cancel_url: invitee.cancelUrl ?? null,
        });
        if (invitee.prospectId) {
            await this.summaryService.refresh(invitee.prospectId, {
                booking: {
                    booking_id: booking.id,
                    status: booking.status,
                    scheduled_at: booking.scheduled_at,
                    join_url: booking.join_url,
                    reschedule_url: booking.reschedule_url,
                    cancel_url: booking.cancel_url,
                },
            });
        }
    }
    async adoptClientReportedBooking(bookingId, invitee) {
        await this.bookingRepository.update(bookingId, {
            scheduler_event_id: invitee.inviteeUri,
            scheduler_invitee_id: invitee.scheduledEventUri,
            invitee_email: invitee.email ?? null,
            invitee_name: invitee.name ?? null,
            scheduled_at: invitee.startsAt ? new Date(invitee.startsAt) : null,
            scheduled_end_at: invitee.endsAt ? new Date(invitee.endsAt) : null,
            join_url: invitee.joinUrl ?? null,
            reschedule_url: invitee.rescheduleUrl ?? null,
            cancel_url: invitee.cancelUrl ?? null,
            client_reported_at: null,
        });
        this.logger.log(`Calendly invitee ${invitee.inviteeUri} adopted booking ${bookingId}, ` +
            `which the visitor's browser had reported first.`);
        if (invitee.prospectId) {
            await this.summaryService.refresh(invitee.prospectId);
        }
    }
    async handleCalendlyInviteeCanceled(invitee) {
        const booking = await this.bookingRepository.findBySchedulerEventId(invitee.inviteeUri);
        if (!booking) {
            this.logger.warn(`Calendly cancellation for unknown invitee ${invitee.inviteeUri}`);
            return;
        }
        await this.bookingRepository.update(booking.id, {
            status: 'cancelled',
            cancellation_reason: invitee.cancellationReason ?? null,
        });
        if (booking.prospect_id) {
            await this.summaryService.refresh(booking.prospect_id, {
                booking: {
                    booking_id: booking.id,
                    status: 'cancelled',
                    scheduled_at: booking.scheduled_at,
                    cancellation_reason: invitee.cancellationReason ?? null,
                },
            });
        }
        if (booking.status === 'confirmed') {
            this.logger.warn(`A PAID consultation was cancelled (booking ${booking.id}) — this needs ` +
                `an agent to decide on reschedule or refund.`);
        }
    }
    async handleStripeCheckoutCompleted(session) {
        const payment = await this.paymentsService.markPaidFromSession(session);
        if (!payment)
            return;
        const prospectId = payment.prospect_id;
        const booking = payment.booking_id
            ? await this.bookingRepository
                .findById(payment.booking_id)
                .catch(() => null)
            : await this.bookingRepository.findLatestForProspect(prospectId);
        if (!booking) {
            this.logger.error(`Payment ${payment.id} completed but no booking was found for prospect ` +
                `${prospectId} — the consult is paid for with no slot held.`);
        }
        else if (booking.status === 'confirmed') {
            this.logger.log(`Booking ${booking.id} was already confirmed — continuing with the ` +
                `remaining steps in case an earlier attempt stopped here.`);
        }
        else {
            await this.bookingRepository.update(booking.id, { status: 'confirmed' });
        }
        await this.prospectService.advanceStage(prospectId, 'booked');
        const summary = await this.summaryService.get(prospectId);
        await this.summaryService.refresh(prospectId, {
            payment: {
                payment_id: payment.id,
                status: payment.status,
                amount_cents: payment.amount_cents,
                currency: payment.currency,
                paid_at: payment.paid_at,
            },
            ...(booking
                ? {
                    booking: {
                        booking_id: booking.id,
                        status: 'confirmed',
                        scheduled_at: booking.scheduled_at,
                        join_url: booking.join_url,
                        reschedule_url: booking.reschedule_url,
                        cancel_url: booking.cancel_url,
                    },
                }
                : {}),
        });
        try {
            const prospect = await this.prospectService.findById(prospectId);
            const eligibility = asRecord(summary?.eligibility);
            await this.notifier.notifyBookingConfirmed(prospect, {
                scheduledAt: booking?.scheduled_at ?? null,
                amountCents: payment.amount_cents ?? null,
                currency: payment.currency,
                recommendedSubclass: str(eligibility.recommended_subclass) ?? null,
                blockers: strList(eligibility.blockers),
                openQuestions: strList(eligibility.open_questions),
            });
        }
        catch (error) {
            this.logger.error(`Booking confirmed for prospect ${prospectId} but the agent alert failed: ${error.message}`);
        }
    }
    async handleStripeSessionUnpaid(sessionId, outcome) {
        const payment = await this.paymentsService.markSessionUnpaid(sessionId, outcome);
        if (!payment) {
            this.logger.warn(`Stripe session ${sessionId} ${outcome}, but we have no payment row ` +
                `for it. Nothing to update.`);
            return;
        }
        await this.summaryService.refresh(payment.prospect_id);
    }
    async processOnce(provider, externalId, eventType, payload, handler) {
        const event = await this.webhookEventRepository.claim(provider, externalId, eventType, payload);
        if (!event)
            return false;
        try {
            await handler();
            await this.webhookEventRepository.markProcessed(event.id);
            return true;
        }
        catch (error) {
            await this.webhookEventRepository.markFailed(event.id, error.message);
            throw error;
        }
    }
    findProspectIdInQuestions(questionsAndAnswers) {
        if (!Array.isArray(questionsAndAnswers))
            return undefined;
        for (const entry of questionsAndAnswers) {
            const qa = asRecord(entry);
            if (/reference|prospect/i.test(str(qa.question) ?? '')) {
                return str(qa.answer)?.trim() || undefined;
            }
        }
        return undefined;
    }
};
exports.WebhooksService = WebhooksService;
exports.WebhooksService = WebhooksService = WebhooksService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [webhook_event_repository_1.WebhookEventRepository,
        prospect_service_1.ProspectService,
        prospect_summary_service_1.ProspectSummaryService,
        prospect_notifier_service_1.ProspectNotifierService,
        payments_service_1.PaymentsService,
        consultation_repository_1.ConsultationBookingRepository])
], WebhooksService);
function safeEqualHex(expected, provided) {
    if (expected.length !== provided.length)
        return false;
    try {
        return (0, crypto_1.timingSafeEqual)(Buffer.from(expected, 'hex'), Buffer.from(provided, 'hex'));
    }
    catch {
        return false;
    }
}
//# sourceMappingURL=webhooks.service.js.map