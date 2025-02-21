import { useEffect, useState } from "react";
import { scoreApi } from "@/api/scores";
import type { LanguageScoreWithUser, VerifyStatus } from "@/types/scores";
import { ScoreVerifyButton } from "../ScoreVerifyButton";
import { format } from "date-fns";

interface Props {
  verifyFilter: VerifyStatus;
}

const S3_BASE_URL = import.meta.env.VITE_S3_BASE_URL;

export function LanguageScoreTable({ verifyFilter }: Props) {
  const [scores, setScores] = useState<LanguageScoreWithUser[]>([]);
  const [page] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchScores = async () => {
    setLoading(true);
    try {
      const response = await scoreApi.getLanguageScores(
        { verifyStatus: verifyFilter },
        page,
      );
      setScores(response.content);
    } catch (error) {
      console.error("Failed to fetch Language scores:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScores();
  }, [verifyFilter, page]);

  const handleVerifyStatus = async (
    id: number,
    status: VerifyStatus,
    reason?: string,
  ) => {
    try {
      await scoreApi.updateLanguageScore(id, {
        verifyStatus: status,
        rejectedReason: reason,
      });
      fetchScores();
    } catch (error) {
      console.error("Failed to update Language score:", error);
    }
  };

  if (loading) return <div>로딩중...</div>;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              ID
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              닉네임
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              시험종류
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              점수
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              상태
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              제출일
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              거절사유
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              인증파일
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              작업
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {scores.map((score) => (
            <tr key={score.languageTestScoreStatusResponse.id}>
              <td className="whitespace-nowrap px-6 py-4">
                {score.languageTestScoreStatusResponse.id}
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                <div className="flex items-center">
                  <img
                    src={score.siteUserResponse.profileImageUrl}
                    alt="프로필"
                    className="mr-2 h-8 w-8 rounded-full"
                  />
                  {score.siteUserResponse.nickname}
                </div>
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                {
                  score.languageTestScoreStatusResponse.languageTestResponse
                    .languageTestType
                }
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                {
                  score.languageTestScoreStatusResponse.languageTestResponse
                    .languageTestScore
                }
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                {score.languageTestScoreStatusResponse.verifyStatus}
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                {format(
                  new Date(score.languageTestScoreStatusResponse.createdAt),
                  "yyyy-MM-dd HH:mm",
                )}
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                {score.languageTestScoreStatusResponse.rejectedReason || "-"}
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                <a
                  href={`${S3_BASE_URL}${score.languageTestScoreStatusResponse.languageTestResponse.languageTestReportUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 hover:underline"
                >
                  파일 보기
                </a>
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                <ScoreVerifyButton
                  currentStatus={
                    score.languageTestScoreStatusResponse.verifyStatus
                  }
                  onVerifyChange={(status, reason) =>
                    handleVerifyStatus(
                      score.languageTestScoreStatusResponse.id,
                      status,
                      reason,
                    )
                  }
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
