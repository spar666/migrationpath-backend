import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PricingService } from './pricing.service';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { CreatePackageDto } from './dto/create-package.dto';
import { UpdatePackageDto } from './dto/update-package.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { User } from '../common/decorators/user.decorator';
import { AuthUser } from '../common/interfaces/auth-user.interface';

@ApiTags('pricing')
@UseInterceptors(CacheInterceptor)
@Controller('pricing')
export class PricingController {
  constructor(private readonly pricingService: PricingService) {}

  // ─── Packages ──────────────────────────────────────────────

  @Get('packages')
  @CacheKey('service_packages')
  @CacheTTL(3600) // 1 hour
  @ApiOperation({ summary: 'Get list of active service packages' })
  getPackages() {
    return this.pricingService.getActivePackages();
  }

  @Post('packages')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Create a service package (admin)' })
  createPackage(@Body() dto: CreatePackageDto) {
    return this.pricingService.createPackage(dto);
  }

  @Patch('packages/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Update a service package (admin)' })
  updatePackage(@Param('id') id: string, @Body() dto: UpdatePackageDto) {
    return this.pricingService.updatePackage(id, dto);
  }

  @Delete('packages/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Delete a service package (admin)' })
  deletePackage(@Param('id') id: string) {
    return this.pricingService.deletePackage(id);
  }

  // ─── Quotes ────────────────────────────────────────────────

  @Post('quotes')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Generate a quote for a package' })
  createQuote(@User() user: AuthUser, @Body() createQuoteDto: CreateQuoteDto) {
    return this.pricingService.createQuote(user.id, createQuoteDto);
  }

  @Get('quotes')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'List all my quotes' })
  getMyQuotes(@User() user: AuthUser) {
    return this.pricingService.getMyQuotes(user.id);
  }
}
