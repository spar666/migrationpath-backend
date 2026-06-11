import { PartialType } from '@nestjs/swagger';
import { SaveProgressDto } from './save-progress.dto';

export class UpdateProgressDto extends PartialType(SaveProgressDto) {}
