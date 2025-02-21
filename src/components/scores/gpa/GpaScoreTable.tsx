import { useEffect, useState } from "react";
import { scoreApi } from "@/api/scores";
import type { GpaScoreWithUser, VerifyStatus } from "@/types/scores";
import { ScoreVerifyButton } from "../ScoreVerifyButton";
import { format } from "date-fns";

interface Props {
  verifyFilter: VerifyStatus;
}

const S3_BASE_URL = import.meta.env.VITE_S3_BASE_URL;

export function GpaScoreTable({ verifyFilter }: Props) {
  const [scores, setScores] = useState<GpaScoreWithUser[]>([]);
  const [page] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchScores = async () => {
    setLoading(true);
    try {
      const response = await scoreApi.getGpaScores(
        { verifyStatus: verifyFilter },
        page,
      );
      setScores(response.content);
    } catch (error) {
      console.error("Failed to fetch GPA scores:", error);
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
      await scoreApi.updateGpaScore(id, {
        verifyStatus: status,
        rejectedReason: reason,
      });
      fetchScores();
    } catch (error) {
      console.error("Failed to update GPA score:", error);
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
              GPA
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              기준점수
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
            <tr key={score.gpaScoreStatusResponse.id}>
              <td className="whitespace-nowrap px-6 py-4">
                {score.gpaScoreStatusResponse.id}
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
                {score.gpaScoreStatusResponse.gpaResponse.gpa}
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                {score.gpaScoreStatusResponse.gpaResponse.gpaCriteria}
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                {score.gpaScoreStatusResponse.verifyStatus}
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                {format(
                  new Date(score.gpaScoreStatusResponse.createdAt),
                  "yyyy-MM-dd HH:mm",
                )}
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                {score.gpaScoreStatusResponse.rejectedReason || "-"}
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                <a
                  href={`${S3_BASE_URL}${score.gpaScoreStatusResponse.gpaResponse.gpaReportUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 hover:underline"
                >
                  파일 보기
                </a>
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                <ScoreVerifyButton
                  currentStatus={score.gpaScoreStatusResponse.verifyStatus}
                  onVerifyChange={(status, reason) =>
                    handleVerifyStatus(
                      score.gpaScoreStatusResponse.id,
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
