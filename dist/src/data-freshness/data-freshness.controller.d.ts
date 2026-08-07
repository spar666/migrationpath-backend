import { DataFreshnessService } from './data-freshness.service';
import { UpdateDataSourceDto } from './dto/update-data-source.dto';
export declare class DataFreshnessController {
    private readonly service;
    constructor(service: DataFreshnessService);
    findAll(): Promise<import("./data-freshness.service").FreshnessRow[]>;
    verify(domain: string): Promise<import("./data-freshness.service").FreshnessRow>;
    update(domain: string, dto: UpdateDataSourceDto): Promise<import("./entities/data-source-meta.entity").DataSourceMeta>;
}
