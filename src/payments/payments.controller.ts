import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreateConsultationCheckoutDto } from './dto/create-checkout.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  /**
   * PUBLIC. The prospect paying to confirm their consult has no account —
   * that is the whole point of the funnel — so this cannot sit behind
   * JwtAuthGuard.
   *
   * What stops abuse is that the body carries no amount (the price is fixed
   * server side), the prospect must already hold a booking, and a prospect who
   * has paid cannot pay again.
   */
  @Post('consultation/checkout')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({
    summary: 'Create a Stripe Checkout session for the consultation fee (public)',
  })
  createConsultationCheckout(@Body() dto: CreateConsultationCheckoutDto) {
    return this.paymentsService.createConsultationCheckout(dto);
  }

  @Get('prospect/:prospectId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'List payments for a prospect (admin only)' })
  findForProspect(@Param('prospectId') prospectId: string) {
    return this.paymentsService.findForProspect(prospectId);
  }
}
