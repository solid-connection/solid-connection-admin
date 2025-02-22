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
import { StatusBadge } from "../StatusBadge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

  return (
    <div className="rounded-lg border bg-white shadow">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>닉네임</TableHead>
              <TableHead>시험종류</TableHead>
              <TableHead>점수</TableHead>
              <TableHead>상태</TableHead>
              <TableHead>제출일</TableHead>
              <TableHead>거절사유</TableHead>
              <TableHead>인증파일</TableHead>
              <TableHead>작업</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center">
                  <div className="flex items-center justify-center">
                    <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-gray-900"></div>
                    <span className="ml-2">로딩중...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : scores.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-gray-500">
                  데이터가 없습니다
                </TableCell>
              </TableRow>
            ) : (
              scores.map((score) => (
                <TableRow
                  key={score.languageTestScoreStatusResponse.id}
                  className="hover:bg-gray-50"
                >
                  <TableCell>
                    {score.languageTestScoreStatusResponse.id}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <img
                        src={score.siteUserResponse.profileImageUrl}
                        alt="프로필"
                        className="mr-2 h-8 w-8 rounded-full"
                      />
                      {score.siteUserResponse.nickname}
                    </div>
                  </TableCell>
                  <TableCell>
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
                          score.languageTestScoreStatusResponse
                            .languageTestResponse.languageTestType,
                      )?.label ||
                      score.languageTestScoreStatusResponse.languageTestResponse
                        .languageTestType
                    )}
                  </TableCell>
                  <TableCell>
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
                          score.languageTestScoreStatusResponse
                            .languageTestResponse.languageTestScore
                        }
                        <button
                          onClick={() => handleEdit(score)}
                          className="rounded bg-gray-100 px-2 py-1 text-gray-600 hover:bg-gray-200"
                        >
                          수정
                        </button>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <StatusBadge
                      status={
                        score.languageTestScoreStatusResponse.verifyStatus
                      }
                    />
                  </TableCell>
                  <TableCell>
                    {format(
                      new Date(score.languageTestScoreStatusResponse.createdAt),
                      "yyyy-MM-dd HH:mm",
                    )}
                  </TableCell>
                  <TableCell>
                    {score.languageTestScoreStatusResponse.rejectedReason ||
                      "-"}
                  </TableCell>
                  <TableCell>
                    <a
                      href={`${S3_BASE_URL}${score.languageTestScoreStatusResponse.languageTestResponse.languageTestReportUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      파일 보기
                    </a>
                  </TableCell>
                  <TableCell>
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
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
