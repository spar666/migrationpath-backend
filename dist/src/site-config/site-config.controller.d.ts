import { AuthUser } from '../common/interfaces/auth-user.interface';
import { SiteConfigService } from './site-config.service';
import { UpdateSiteConfigDto } from './dto/update-site-config.dto';
export declare class SiteConfigController {
    private readonly siteConfigService;
    constructor(siteConfigService: SiteConfigService);
    getPublicConfig(): Promise<Record<string, any>>;
    getConfig(): Promise<Record<string, any>>;
    updateConfig(dto: UpdateSiteConfigDto, user: AuthUser): Promise<Record<string, any>>;
}
