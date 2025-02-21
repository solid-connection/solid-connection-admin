import type {
  GpaScore,
  LanguageTestScore,
  ScoreSearchCondition,
  PageResponse,
} from "../types/scores";
import { axiosInstance } from "@/utils/axiosInstance";

const BASE_URL = "/admin/scores";

export const scoreApi = {
  // GPA 성적 조회
  getGpaScores: async (
    condition: ScoreSearchCondition,
    page: number = 1,
    size: number = 10,
  ) => {
    const response = await axiosInstance.get<PageResponse<GpaScore>>(
      `${BASE_URL}/gpas`,
      {
        params: {
          ...condition,
          page,
          size,
        },
      },
    );
    return response.data;
  },

  // GPA 성적 수정
  updateGpaScore: async (
    id: number,
    data: { verifyStatus: string; rejectedReason?: string },
  ) => {
    const response = await axiosInstance.put<GpaScore>(
      `${BASE_URL}/gpas/${id}`,
      data,
    );
    return response.data;
  },

  // 어학성적 조회
  getLanguageScores: async (
    condition: ScoreSearchCondition,
    page: number = 1,
    size: number = 10,
  ) => {
    const response = await axiosInstance.get<PageResponse<LanguageTestScore>>(
      `${BASE_URL}/language-tests`,
      {
        params: {
          ...condition,
          page,
          size,
        },
      },
    );
    return response.data;
  },

  // 어학성적 수정
  updateLanguageScore: async (
    id: number,
    data: { verifyStatus: string; rejectedReason?: string },
  ) => {
    const response = await axiosInstance.put<LanguageTestScore>(
      `${BASE_URL}/language-tests/${id}`,
      data,
    );
    return response.data;
  },
};
