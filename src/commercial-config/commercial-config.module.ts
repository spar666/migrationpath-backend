import { Module, Injectable, Controller, Get, Patch, Body, Param, UseGuards, BadRequestException, NotFoundException } from '@nestjs/common';
import { TypeOrmModule, InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IsNumber } from 'class-validator';
import { CommercialConfig } from './entities/commercial-config.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
export class UpdateCommercialConfigDto { @IsNumber() numericValue: number; }
@Injectable()
export class CommercialConfigService {
  constructor(@InjectRepository(CommercialConfig) private readonly repo: Repository<CommercialConfig>) {}
  async snapshot(): Promise<Map<string, number>> { return new Map((await this.repo.find()).map(r => [r.configKey, Number(r.numericValue)])); }
  findAll() { return this.repo.find({ order: { configKey: 'ASC' } }); }
  async update(configKey: string, dto: UpdateCommercialConfigDto) {
    const row = await this.repo.findOneBy({ configKey });
    if (!row) throw new NotFoundException('Commercial setting not found');
    if (!Number.isFinite(dto.numericValue) || dto.numericValue < 0 ||
      ((configKey.startsWith('service.') || configKey === 'requireAbnForBusiness') && ![0, 1].includes(dto.numericValue))) throw new BadRequestException('Invalid commercial value');
    row.numericValue = dto.numericValue; return this.repo.save(row);
  }
}
@Controller('commercial-config')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class CommercialConfigController {
  constructor(private readonly service: CommercialConfigService) {}
  @Get() list() { return this.service.findAll(); }
  @Patch(':key') update(@Param('key') key: string, @Body() dto: UpdateCommercialConfigDto) { return this.service.update(key, dto); }
}
@Module({ imports: [TypeOrmModule.forFeature([CommercialConfig])], providers: [CommercialConfigService], controllers: [CommercialConfigController], exports: [CommercialConfigService] })
export class CommercialConfigModule {}
