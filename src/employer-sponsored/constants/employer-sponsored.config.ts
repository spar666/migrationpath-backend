/** Stream structure only. Legislative numbers are read from policy_config. */
export interface SubclassRule {
  label: string;
  maxAge: number | null;
  minYearsExperience: number;
  minSalary: number;
  minEnglishOverall: number;
  minEnglishPerBand: number;
  requiresRegional: boolean;
  requiresLmt: boolean;
  occupationLists: string[];
  permanentResidence: 'direct' | 'pathway' | 'none';
}
export const CONSIDERED_SUBCLASSES = ['186-de', '186-trt', '494-es', '482-core', '482-specialist'];
export type OccupationListCheck = (code: string | undefined, lists: string[]) => Promise<boolean | null> | boolean | null;
export interface ClientFitInput {
  party: 'applicant' | 'business'; age?: number; annualSalary?: number;
  subclass?: string; hasAbn?: boolean; statutoryEligible: boolean;
}
export interface ClientFitResult { fit: boolean; reasons: string[]; }
export function computeClientFit(input: ClientFitInput, config: Map<string, number>): ClientFitResult {
  const reasons: string[] = [];
  if (input.annualSalary == null || input.annualSalary < (config.get('minSalaryOfInterest') ?? Infinity)) reasons.push('Income does not meet the practice intake criteria or is unknown.');
  if (input.age == null || input.age > (config.get('hardAgeCeiling') ?? -1)) reasons.push('Age needs a commercial intake review.');
  if (input.party === 'business' && config.get('requireAbnForBusiness') !== 0 && !input.hasAbn) reasons.push('An ABN is required by the practice.');
  if (!input.subclass || config.get(`service.${input.subclass}`) !== 1) reasons.push('This pathway needs a practice intake review.');
  return { fit: reasons.length === 0, reasons };
}
