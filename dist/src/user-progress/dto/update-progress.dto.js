"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateProgressDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const save_progress_dto_1 = require("./save-progress.dto");
class UpdateProgressDto extends (0, swagger_1.PartialType)(save_progress_dto_1.SaveProgressDto) {
}
exports.UpdateProgressDto = UpdateProgressDto;
//# sourceMappingURL=update-progress.dto.js.map