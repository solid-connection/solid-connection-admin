export type VerifyStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface ScoreSearchCondition {
  verifyStatus?: VerifyStatus;
  // 추가 검색 조건이 있다면 여기에 추가
}

export interface GpaScore {
  id: number;
  gpa: number;
  gpaCriteria: number;
  verifyStatus: VerifyStatus;
  rejectedReason?: string;
}

export interface LanguageTestScore {
  id: number;
  languageTestType: string;
  languageTestScore: string;
  verifyStatus: VerifyStatus;
  rejectedReason?: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
