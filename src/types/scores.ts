export type VerifyStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface ScoreSearchCondition {
  verifyStatus?: VerifyStatus;
}

export interface GpaResponse {
  gpa: number;
  gpaCriteria: number;
  gpaReportUrl: string;
}

export interface GpaScore {
  verifyStatus: VerifyStatus;
  rejectedReason?: string;
}

export interface GpaScoreStatusResponse {
  id: number;
  gpaResponse: GpaResponse;
  verifyStatus: VerifyStatus;
  rejectedReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SiteUserResponse {
  id: number;
  nickname: string;
  profileImageUrl: string;
}

export interface GpaScoreWithUser {
  gpaScoreStatusResponse: GpaScoreStatusResponse;
  siteUserResponse: SiteUserResponse;
}

export interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
}

export interface LanguageResponse {
  languageType: string;
  score: number;
  testDate: string;
  expireDate: string;
  languageReportUrl: string;
}

export interface LanguageTestResponse {
  languageTestType: string;
  languageTestScore: string;
  languageTestReportUrl: string;
}

export interface LanguageTestScore {
  verifyStatus: VerifyStatus;
  rejectedReason?: string;
}

export interface LanguageTestScoreStatusResponse {
  id: number;
  languageTestResponse: LanguageTestResponse;
  verifyStatus: VerifyStatus;
  rejectedReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LanguageScoreWithUser {
  languageTestScoreStatusResponse: LanguageTestScoreStatusResponse;
  siteUserResponse: SiteUserResponse;
}

export type LanguageTestType = "TOEIC" | "TOEFL" | "TEPS" | "IELTS";

export interface GpaScoreUpdateRequest {
  gpa: number;
  gpaCriteria: number;
  verifyStatus: VerifyStatus;
  rejectedReason?: string;
}

export interface LanguageTestScoreUpdateRequest {
  languageTestType: LanguageTestType;
  languageTestScore: string;
  verifyStatus: VerifyStatus;
  rejectedReason?: string;
}
