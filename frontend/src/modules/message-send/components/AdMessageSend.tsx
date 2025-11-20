"use client";

import { useState } from "react";
import { GeneralMessageSend } from "./GeneralMessageSend";
import { Alert } from "@/modules/common/ui/components/Alert";

export function AdMessageSend() {
  const [agreed, setAgreed] = useState(false);

  return (
    <div className="space-y-6">
      {/* Legal Notice */}
      <Alert variant="warning">
        <div className="space-y-2">
          <h4 className="font-semibold">광고성 정보 전송 규정 안내</h4>
          <ul className="text-sm space-y-1 list-disc list-inside">
            <li>광고성 메시지는 평일 08:00~21:00에만 발송 가능합니다</li>
            <li>(광고) 문구가 메시지 맨 앞에 자동 삽입됩니다</li>
            <li>080 수신거부 번호가 연동된 발신번호만 사용 가능합니다</li>
            <li>수신거부 번호는 자동으로 제외됩니다</li>
          </ul>
        </div>
      </Alert>

      {/* Agreement Checkbox */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <label className="flex items-start">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-1 mr-2"
            required
          />
          <span className="text-sm">
            광고성 정보 전송 규정을 준수하였으며, 수신자 동의를 받았음을 확인합니다.
          </span>
        </label>
      </div>

      {/* General Message Send Component (with ad-specific modifications) */}
      <GeneralMessageSend />
    </div>
  );
}

