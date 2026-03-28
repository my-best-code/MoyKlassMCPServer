export type ClassStatus = 'opened' | 'closed' | 'archive';
export type ClassPayType = 'full' | 'lessons';
export type LessonAccess = 'always' | 'subExists' | 'invoiceFullPay' | 'invoiceHalfPay';
export type LimitCreateWorkOffType = 'sub' | 'period';
export type InvoiceCreateRule = 'create' | 'setStatus';
export type InvoicePayDateType = 'relative' | 'exact';

export interface PayPassRules {
  payPassReason?: boolean;
  payPassReasonRate?: number;
  payPassNoReason?: boolean;
  payPassNoReasonRate?: number;
}

export interface ClassStats {
  income?: number;
  debt?: number;
}

export interface LessonSettings {
  webinarAccess?: LessonAccess;
  videoAccess?: LessonAccess;
  lessonTaskAccess?: LessonAccess;
  homeTaskAccess?: LessonAccess;
}

export interface WorkOff {
  payPassWorkOff?: boolean;
  payPassWorkOffRate?: number;
  limitWorkOffCount?: boolean;
  maxWorkOffCount?: number;
  limitCreateWorkOff?: boolean;
  limitCreateWorkOffType?: LimitCreateWorkOffType;
  limitCreateWorkOffPeriod?: string;
}

export interface Invoices {
  autoCreate?: boolean;
  createRule?: InvoiceCreateRule;
  joinStateId?: number[];
  payDateType?: InvoicePayDateType;
  payDateDays?: number;
  payDate?: string;
}

export interface BonusProgram {
  restrictBP?: boolean;
  maxDiscount?: number;
  accrueBonuses?: number;
  sumLimit?: number;
}

export interface MoyKlassClass {
  id: number;
  name: string;
  beginDate?: string;
  maxStudents?: number;
  status: ClassStatus;
  createdAt?: string;
  courseId?: number;
  payType?: ClassPayType;
  filialId?: number;
  payPass?: boolean;
  payPassRules?: PayPassRules;
  price?: number;
  priceComment?: string;
  showDates?: boolean;
  priceForWidget?: string;
  color?: string;
  managerIds?: number[];
  comment?: string;
  stats?: ClassStats;
  lessonSettings?: LessonSettings;
  workOff?: WorkOff;
  invoices?: Invoices;
  bonusProgram?: BonusProgram;
}
