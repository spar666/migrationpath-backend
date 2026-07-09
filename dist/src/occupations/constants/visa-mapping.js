"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SKILLED_LIST_VISA_MATRIX = exports.VISA_CATALOGUE = exports.VisaResidencyType = exports.SkilledList = void 0;
exports.resolveEligibleSubclasses = resolveEligibleSubclasses;
var SkilledList;
(function (SkilledList) {
    SkilledList["MLTSSL"] = "MLTSSL";
    SkilledList["STSOL"] = "STSOL";
    SkilledList["ROL"] = "ROL";
    SkilledList["CSOL"] = "CSOL";
})(SkilledList || (exports.SkilledList = SkilledList = {}));
var VisaResidencyType;
(function (VisaResidencyType) {
    VisaResidencyType["PERMANENT"] = "permanent";
    VisaResidencyType["PROVISIONAL"] = "provisional";
    VisaResidencyType["TEMPORARY"] = "temporary";
})(VisaResidencyType || (exports.VisaResidencyType = VisaResidencyType = {}));
exports.VISA_CATALOGUE = [
    {
        subclassNumber: '189',
        streamTitle: 'Points-tested',
        residencyType: VisaResidencyType.PERMANENT,
        name: 'Skilled Independent',
    },
    {
        subclassNumber: '190',
        streamTitle: 'State/Territory Nominated',
        residencyType: VisaResidencyType.PERMANENT,
        name: 'Skilled Nominated',
    },
    {
        subclassNumber: '491',
        streamTitle: 'State/Territory or Family Sponsored',
        residencyType: VisaResidencyType.PROVISIONAL,
        name: 'Skilled Work Regional (Provisional)',
    },
    {
        subclassNumber: '485',
        streamTitle: 'Graduate Work',
        residencyType: VisaResidencyType.TEMPORARY,
        name: 'Temporary Graduate',
    },
    {
        subclassNumber: '494',
        streamTitle: 'Employer Sponsored',
        residencyType: VisaResidencyType.PROVISIONAL,
        name: 'Skilled Employer Sponsored Regional (Provisional)',
    },
    {
        subclassNumber: '482',
        streamTitle: 'Core Skills',
        residencyType: VisaResidencyType.TEMPORARY,
        name: 'Skills in Demand',
    },
    {
        subclassNumber: '186',
        streamTitle: 'Direct Entry',
        residencyType: VisaResidencyType.PERMANENT,
        name: 'Employer Nomination Scheme',
    },
];
exports.SKILLED_LIST_VISA_MATRIX = {
    [SkilledList.MLTSSL]: ['189', '190', '491', '485'],
    [SkilledList.STSOL]: ['190', '491'],
    [SkilledList.ROL]: ['491', '494'],
    [SkilledList.CSOL]: ['482', '186'],
};
function resolveEligibleSubclasses(primaryList) {
    if (!primaryList)
        return [];
    const subclasses = exports.SKILLED_LIST_VISA_MATRIX[primaryList];
    return subclasses ? [...subclasses] : [];
}
//# sourceMappingURL=visa-mapping.js.map