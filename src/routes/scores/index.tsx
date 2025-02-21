import { useState } from "react";
import { GpaScoreTable } from "@/components/scores/gpa/GpaScoreTable"; // 확장자 제거
import { LanguageScoreTable } from "@/components/scores/language/LanguageScoreTable"; // 확장자 제거
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { VerifyStatus } from "@/types/scores";
export default function ScoresPage() {
  const [verifyFilter, setVerifyFilter] = useState<VerifyStatus>("PENDING");

  return (
    <div className="container mx-auto py-6">
      <h1 className="mb-6 text-2xl font-bold">성적 관리</h1>

      <div className="mb-4">
        <select
          value={verifyFilter}
          onChange={(e) => setVerifyFilter(e.target.value as VerifyStatus)}
          className="rounded border p-2"
        >
          <option value="PENDING">대기중</option>
          <option value="APPROVED">승인됨</option>
          <option value="REJECTED">거절됨</option>
        </select>
      </div>

      <Tabs defaultValue="gpa">
        <TabsList>
          <TabsTrigger value="gpa">GPA 성적</TabsTrigger>
          <TabsTrigger value="language">어학성적</TabsTrigger>
        </TabsList>

        <TabsContent value="gpa">
          <GpaScoreTable verifyFilter={verifyFilter} />
        </TabsContent>

        <TabsContent value="language">
          <LanguageScoreTable verifyFilter={verifyFilter} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
