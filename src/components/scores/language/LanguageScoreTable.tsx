import { useEffect, useState } from "react";
import { scoreApi } from "@/api/scores";
import type { LanguageTestScore, VerifyStatus } from "@/types/scores";
import { ScoreVerifyButton } from "../ScoreVerifyButton";

interface Props {
  verifyFilter: VerifyStatus;
}

export function LanguageScoreTable({ verifyFilter }: Props) {
  const [scores, setScores] = useState<LanguageTestScore[]>([]);
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
      console.error("Failed to fetch Language Test scores:", error);
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
      fetchScores(); // 데이터 새로고침
    } catch (error) {
      console.error("Failed to update Language Test score:", error);
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
              시험 종류
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              점수
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              상태
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              거절사유
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              작업
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {scores.map((score) => (
            <tr key={score.id}>
              <td className="whitespace-nowrap px-6 py-4">{score.id}</td>
              <td className="whitespace-nowrap px-6 py-4">
                {score.languageTestType}
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                {score.languageTestScore}
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                {score.verifyStatus}
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                {score.rejectedReason || "-"}
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                <ScoreVerifyButton
                  currentStatus={score.verifyStatus}
                  onVerifyChange={(status, reason) =>
                    handleVerifyStatus(score.id, status, reason)
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
