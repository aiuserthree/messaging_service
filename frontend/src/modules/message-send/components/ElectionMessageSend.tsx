"use client";

import { useState } from "react";
import { GeneralMessageSend } from "./GeneralMessageSend";
import { Input, Alert } from "@/modules/common/ui";
import { Alert as AlertComponent } from "@/modules/common/ui/components/Alert";

export function ElectionMessageSend() {
  const [electionReportNumber, setElectionReportNumber] = useState("");
  const [candidateName, setCandidateName] = useState("");

  return (
    <div className="space-y-6">
      {/* Legal Notice */}
      <AlertComponent variant="warning">
        <div className="space-y-2">
          <h4 className="font-semibold">공직선거법 준수 안내</h4>
          <ul className="text-sm space-y-1 list-disc list-inside">
            <li>선거운동 기간 내에만 발송 가능합니다</li>
            <li>발송 가능 시간: 07:00~23:00</li>
            <li>투표일 발송 불가</li>
            <li>후보자/정당명이 메시지에 포함되어야 합니다</li>
            <li>허위사실, 비방 내용 금지</li>
          </ul>
        </div>
      </AlertComponent>

      {/* Election Info */}
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <Input
          label="선거관리위원회 신고번호"
          value={electionReportNumber}
          onChange={(e) => setElectionReportNumber(e.target.value)}
          placeholder="신고번호를 입력하세요"
          required
        />
        <Input
          label="후보자/정당명"
          value={candidateName}
          onChange={(e) => setCandidateName(e.target.value)}
          placeholder="후보자 또는 정당명을 입력하세요"
          required
        />
      </div>

      {/* General Message Send Component */}
      <GeneralMessageSend />
    </div>
  );
}

