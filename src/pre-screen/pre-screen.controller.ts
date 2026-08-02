import { Body, Controller, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PreScreenService } from './pre-screen.service';
import { SubmitPreScreenDto } from './dto/submit-pre-screen.dto';

@ApiTags('pre-screen')
@Controller('pre-screen')
export class PreScreenController {
  constructor(private readonly preScreenService: PreScreenService) {}

  /**
   * PUBLIC. The native questionnaire posts here.
   *
   * It is unauthenticated by design — requiring a login before a stranger will
   * tell you whether they can migrate is how you get no strangers. The record
   * it writes is the funnel spine; an account can be attached later.
   *
   * Throttled harder than the global limit for the same reason POST /leads is:
   * it is an anonymous endpoint that writes a row and runs the engine.
   */
  @Post()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({
    summary: 'Submit the employer-sponsored pre-screen questionnaire (public)',
  })
  @ApiResponse({
    status: 201,
    description:
      'Returns the live eligibility result plus the prospect id and human reference',
  })
  submit(@Body() dto: SubmitPreScreenDto) {
    return this.preScreenService.submit(dto);
  }
}
