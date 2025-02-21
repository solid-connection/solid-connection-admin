import { useEffect, useState } from "react";
import { scoreApi } from "@/api/scores";
import type {
  LanguageScoreWithUser,
  VerifyStatus,
  LanguageTestType,
} from "@/types/scores";
import { ScoreVerifyButton } from "../ScoreVerifyButton";
import { format } from "date-fns";
import { toast } from "sonner";

interface Props {
  verifyFilter: VerifyStatus;
}

const S3_BASE_URL = import.meta.env.VITE_S3_BASE_URL;

const LANGUAGE_TEST_OPTIONS: { value: LanguageTestType; label: string }[] = [
  { value: "TOEIC", label: "TOEIC" },
  { value: "TOEFL_IBT", label: "TOEFL IBT" },
  { value: "TOEFL_ITP", label: "TOEFL ITP" },
  { value: "IELTS", label: "IELTS" },
  { value: "JLPT", label: "JLPT" },
  { value: "NEW_HSK", label: "NEW HSK" },
  { value: "DALF", label: "DALF" },
  { value: "CEFR", label: "CEFR" },
  { value: "TCF", label: "TCF" },
  { value: "TEF", label: "TEF" },
  { value: "DUOLINGO", label: "DUOLINGO" },
  { value: "ETC", label: "기타" },
];

export function LanguageScoreTable({ verifyFilter }: Props) {
  const [scores, setScores] = useState<LanguageScoreWithUser[]>([]);
  const [page] = useState(1);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingScore, setEditingScore] = useState<string>("");
  const [editingType, setEditingType] = useState<LanguageTestType>("TOEIC");

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
      const score = scores.find(
        (s) => s.languageTestScoreStatusResponse.id === id,
      );
      await scoreApi.updateLanguageScore(id, status, reason, score);
      fetchScores();
    } catch (error) {
      console.error("Failed to update Language score:", error);
      toast.error("성적 상태 업데이트에 실패했습니다");
    }
  };

  const handleEdit = (score: LanguageScoreWithUser) => {
    setEditingId(score.languageTestScoreStatusResponse.id);
    setEditingScore(
      score.languageTestScoreStatusResponse.languageTestResponse
        .languageTestScore,
    );
    setEditingType(
      score.languageTestScoreStatusResponse.languageTestResponse
        .languageTestType as LanguageTestType,
    );
  };

  const handleSave = async (score: LanguageScoreWithUser) => {
    try {
      await scoreApi.updateLanguageScore(
        score.languageTestScoreStatusResponse.id,
        score.languageTestScoreStatusResponse.verifyStatus,
        score.languageTestScoreStatusResponse.rejectedReason,
        {
          ...score,
          languageTestScoreStatusResponse: {
            ...score.languageTestScoreStatusResponse,
            languageTestResponse: {
              ...score.languageTestScoreStatusResponse.languageTestResponse,
              languageTestScore: editingScore,
              languageTestType: editingType,
            },
          },
        },
      );
      setEditingId(null);
      fetchScores();
      toast.success("어학성적이 수정되었습니다");
    } catch (error) {
      console.error("Failed to update language score:", error);
      toast.error("어학성적 수정에 실패했습니다");
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
                {editingId === score.languageTestScoreStatusResponse.id ? (
                  <div className="flex gap-2">
                    <select
                      value={editingType}
                      onChange={(e) =>
                        setEditingType(e.target.value as LanguageTestType)
                      }
                      className="rounded border px-2 py-1"
                    >
                      {LANGUAGE_TEST_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  LANGUAGE_TEST_OPTIONS.find(
                    (option) =>
                      option.value ===
                      score.languageTestScoreStatusResponse.languageTestResponse
                        .languageTestType,
                  )?.label ||
                  score.languageTestScoreStatusResponse.languageTestResponse
                    .languageTestType
                )}
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                {editingId === score.languageTestScoreStatusResponse.id ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editingScore}
                      onChange={(e) => setEditingScore(e.target.value)}
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
                    {
                      score.languageTestScoreStatusResponse.languageTestResponse
                        .languageTestScore
                    }
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
