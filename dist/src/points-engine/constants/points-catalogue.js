"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.STRUCTURED_CATEGORY_KEYS = exports.STRUCTURED_POINTS_RULES = exports.DEFAULT_VISA_GROUP = exports.GSM_MAX_AGE = exports.GSM_PASS_MARK = exports.REGIONAL_STUDY_POINTS = exports.COMBINED_WORK_POINTS_CAP = exports.QualificationLevel = exports.EnglishProficiency = exports.PointsCategory = void 0;
var PointsCategory;
(function (PointsCategory) {
    PointsCategory["AGE"] = "AGE";
    PointsCategory["ENGLISH"] = "ENGLISH";
    PointsCategory["OVERSEAS_WORK"] = "OVERSEAS_WORK";
    PointsCategory["AUSTRALIAN_WORK"] = "AUSTRALIAN_WORK";
    PointsCategory["QUALIFICATIONS"] = "QUALIFICATIONS";
    PointsCategory["REGIONAL_STUDY"] = "REGIONAL_STUDY";
})(PointsCategory || (exports.PointsCategory = PointsCategory = {}));
var EnglishProficiency;
(function (EnglishProficiency) {
    EnglishProficiency["COMPETENT"] = "competent";
    EnglishProficiency["PROFICIENT"] = "proficient";
    EnglishProficiency["SUPERIOR"] = "superior";
})(EnglishProficiency || (exports.EnglishProficiency = EnglishProficiency = {}));
var QualificationLevel;
(function (QualificationLevel) {
    QualificationLevel["DOCTORATE"] = "doctorate";
    QualificationLevel["BACHELOR_MASTERS"] = "bachelor_masters";
    QualificationLevel["DIPLOMA_TRADE"] = "diploma_trade";
    QualificationLevel["OTHER_RECOGNISED"] = "other_recognised";
})(QualificationLevel || (exports.QualificationLevel = QualificationLevel = {}));
exports.COMBINED_WORK_POINTS_CAP = 20;
exports.REGIONAL_STUDY_POINTS = 5;
exports.GSM_PASS_MARK = 65;
exports.GSM_MAX_AGE = 45;
exports.DEFAULT_VISA_GROUP = 'GSM';
exports.STRUCTURED_POINTS_RULES = [
    { visaGroup: 'GSM', category: PointsCategory.AGE, attributeLabel: null, minValue: 18, maxValue: 24, points: 25 },
    { visaGroup: 'GSM', category: PointsCategory.AGE, attributeLabel: null, minValue: 25, maxValue: 32, points: 30 },
    { visaGroup: 'GSM', category: PointsCategory.AGE, attributeLabel: null, minValue: 33, maxValue: 39, points: 25 },
    { visaGroup: 'GSM', category: PointsCategory.AGE, attributeLabel: null, minValue: 40, maxValue: 44, points: 15 },
    { visaGroup: 'GSM', category: PointsCategory.AGE, attributeLabel: null, minValue: 45, maxValue: 120, points: 0 },
    { visaGroup: 'GSM', category: PointsCategory.ENGLISH, attributeLabel: EnglishProficiency.SUPERIOR, minValue: null, maxValue: null, points: 20 },
    { visaGroup: 'GSM', category: PointsCategory.ENGLISH, attributeLabel: EnglishProficiency.PROFICIENT, minValue: null, maxValue: null, points: 10 },
    { visaGroup: 'GSM', category: PointsCategory.ENGLISH, attributeLabel: EnglishProficiency.COMPETENT, minValue: null, maxValue: null, points: 0 },
    { visaGroup: 'GSM', category: PointsCategory.OVERSEAS_WORK, attributeLabel: null, minValue: 0, maxValue: 2, points: 0 },
    { visaGroup: 'GSM', category: PointsCategory.OVERSEAS_WORK, attributeLabel: null, minValue: 3, maxValue: 4, points: 5 },
    { visaGroup: 'GSM', category: PointsCategory.OVERSEAS_WORK, attributeLabel: null, minValue: 5, maxValue: 7, points: 10 },
    { visaGroup: 'GSM', category: PointsCategory.OVERSEAS_WORK, attributeLabel: null, minValue: 8, maxValue: 120, points: 15 },
    { visaGroup: 'GSM', category: PointsCategory.AUSTRALIAN_WORK, attributeLabel: null, minValue: 0, maxValue: 0, points: 0 },
    { visaGroup: 'GSM', category: PointsCategory.AUSTRALIAN_WORK, attributeLabel: null, minValue: 1, maxValue: 2, points: 5 },
    { visaGroup: 'GSM', category: PointsCategory.AUSTRALIAN_WORK, attributeLabel: null, minValue: 3, maxValue: 4, points: 10 },
    { visaGroup: 'GSM', category: PointsCategory.AUSTRALIAN_WORK, attributeLabel: null, minValue: 5, maxValue: 7, points: 15 },
    { visaGroup: 'GSM', category: PointsCategory.AUSTRALIAN_WORK, attributeLabel: null, minValue: 8, maxValue: 120, points: 20 },
    { visaGroup: 'GSM', category: PointsCategory.QUALIFICATIONS, attributeLabel: QualificationLevel.DOCTORATE, minValue: null, maxValue: null, points: 20 },
    { visaGroup: 'GSM', category: PointsCategory.QUALIFICATIONS, attributeLabel: QualificationLevel.BACHELOR_MASTERS, minValue: null, maxValue: null, points: 15 },
    { visaGroup: 'GSM', category: PointsCategory.QUALIFICATIONS, attributeLabel: QualificationLevel.DIPLOMA_TRADE, minValue: null, maxValue: null, points: 10 },
    { visaGroup: 'GSM', category: PointsCategory.QUALIFICATIONS, attributeLabel: QualificationLevel.OTHER_RECOGNISED, minValue: null, maxValue: null, points: 10 },
    { visaGroup: 'GSM', category: PointsCategory.REGIONAL_STUDY, attributeLabel: 'regional', minValue: null, maxValue: null, points: exports.REGIONAL_STUDY_POINTS },
];
exports.STRUCTURED_CATEGORY_KEYS = Object.values(PointsCategory);
//# sourceMappingURL=points-catalogue.js.map