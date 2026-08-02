import { PreScreenService } from './pre-screen.service';
import { SubmitPreScreenDto } from './dto/submit-pre-screen.dto';
export declare class PreScreenController {
    private readonly preScreenService;
    constructor(preScreenService: PreScreenService);
    submit(dto: SubmitPreScreenDto): Promise<import("./pre-screen.service").PreScreenResult>;
}
