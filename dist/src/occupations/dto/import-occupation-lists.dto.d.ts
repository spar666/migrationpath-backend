import { SkilledList } from '../constants/visa-mapping';
export declare class ImportOccupationListRow {
    anzscoCode: string;
    primaryList: SkilledList;
}
export declare class ImportOccupationListsDto {
    resyncVisas?: boolean;
    rows: ImportOccupationListRow[];
}
