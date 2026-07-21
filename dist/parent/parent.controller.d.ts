import { ParentAuditEngine } from './parent-audit.engine';
import { ParentProfileDto } from './dto/parent-profile.dto';
import { ParentAuditResultDto } from './dto/parent-audit-result.dto';
export declare class ParentController {
    private readonly parentAuditEngine;
    constructor(parentAuditEngine: ParentAuditEngine);
    audit(profile: ParentProfileDto): Promise<ParentAuditResultDto>;
}
