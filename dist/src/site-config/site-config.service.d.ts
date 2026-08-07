import { Repository } from 'typeorm';
import { SiteConfig } from './entities/site-config.entity';
import { UpdateSiteConfigDto } from './dto/update-site-config.dto';
export declare class SiteConfigService {
    private readonly repo;
    private readonly logger;
    constructor(repo: Repository<SiteConfig>);
    getConfig(): Promise<Record<string, any>>;
    updateConfig(dto: UpdateSiteConfigDto, userId?: string): Promise<Record<string, any>>;
}
