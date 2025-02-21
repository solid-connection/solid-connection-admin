import { useEffect, useState } from "react";
import { scoreApi } from "@/api/scores";
import type { GpaScoreWithUser, VerifyStatus } from "@/types/scores";
import { ScoreVerifyButton } from "../ScoreVerifyButton";
import { format } from "date-fns";
import { toast } from "sonner";

interface Props {
  verifyFilter: VerifyStatus;
}

const S3_BASE_URL = import.meta.env.VITE_S3_BASE_URL;

export function GpaScoreTable({ verifyFilter }: Props) {
  const [scores, setScores] = useState<GpaScoreWithUser[]>([]);
  const [page] = useState(1);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingGpa, setEditingGpa] = useState<number>(0);
  const [editingGpaCriteria, setEditingGpaCriteria] = useState<number>(0);

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
      const score = scores.find((s) => s.gpaScoreStatusResponse.id === id);
      await scoreApi.updateGpaScore(id, status, reason, score);
      fetchScores();
    } catch (error) {
      console.error("Failed to update GPA score:", error);
      toast.error("성적 상태 업데이트에 실패했습니다");
    }
  };

  const handleEdit = (score: GpaScoreWithUser) => {
    setEditingId(score.gpaScoreStatusResponse.id);
    setEditingGpa(score.gpaScoreStatusResponse.gpaResponse.gpa);
    setEditingGpaCriteria(score.gpaScoreStatusResponse.gpaResponse.gpaCriteria);
  };

  const handleSave = async (score: GpaScoreWithUser) => {
    try {
      await scoreApi.updateGpaScore(
        score.gpaScoreStatusResponse.id,
        score.gpaScoreStatusResponse.verifyStatus,
        score.gpaScoreStatusResponse.rejectedReason,
        {
          ...score,
          gpaScoreStatusResponse: {
            ...score.gpaScoreStatusResponse,
            gpaResponse: {
              ...score.gpaScoreStatusResponse.gpaResponse,
              gpa: editingGpa,
              gpaCriteria: editingGpaCriteria,
            },
          },
        },
      );
      setEditingId(null);
      fetchScores();
      toast.success("GPA가 수정되었습니다");
    } catch (error) {
      console.error("Failed to update GPA:", error);
      toast.error("GPA 수정에 실패했습니다");
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
                {editingId === score.gpaScoreStatusResponse.id ? (
                  <div className="flex gap-2">
                    <input
                      type="number"
                      step="0.01"
                      value={editingGpa}
                      onChange={(e) =>
                        setEditingGpa(parseFloat(e.target.value))
                      }
                      className="w-20 rounded border px-2 py-1"
                    />
                  </div>
                ) : (
                  score.gpaScoreStatusResponse.gpaResponse.gpa
                )}
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                {editingId === score.gpaScoreStatusResponse.id ? (
                  <div className="flex gap-2">
                    <input
                      type="number"
                      step="0.01"
                      value={editingGpaCriteria}
                      onChange={(e) =>
                        setEditingGpaCriteria(parseFloat(e.target.value))
                      }
                      className="w-20 rounded border px-2 py-1"
                    />
                    <button
                      onClick={() => handleSave(score)}
                      className="rounded bg-blue-500 px-2 py-1 text-white hover:bg-blue-600"
                    >
                      저장
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="rounded bg-gray-500 px-2 py-1 text-white hover:bg-gray-600"
                    >
                      취소
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    {score.gpaScoreStatusResponse.gpaResponse.gpaCriteria}
                    <button
                      onClick={() => handleEdit(score)}
                      className="rounded bg-gray-100 px-2 py-1 text-gray-600 hover:bg-gray-200"
                    >
                      수정
                    </button>
                  </div>
                )}
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
