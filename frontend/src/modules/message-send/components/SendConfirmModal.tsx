"use client";

import { Modal, Button } from "@/modules/common/ui";

interface SendInfo {
  callerNumber: string;
  recipientCount: number;
  messageType: string;
  title?: string;
  content: string;
  sendMode: "IMMEDIATE" | "SCHEDULED";
  scheduledAt?: Date | null;
  estimatedCost: number;
}

interface SendConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  sendInfo: SendInfo;
}

export function SendConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  sendInfo,
}: SendConfirmModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="발송 확인" size="md">
      <div className="space-y-4">
        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">발신번호</span>
            <span className="font-medium">{sendInfo.callerNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">수신자 수</span>
            <span className="font-medium">{sendInfo.recipientCount}명</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">메시지 타입</span>
            <span className="font-medium">{sendInfo.messageType}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">발송 시간</span>
            <span className="font-medium">
              {sendInfo.sendMode === "IMMEDIATE"
                ? "즉시 발송"
                : sendInfo.scheduledAt?.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between border-t pt-2">
            <span className="text-sm font-semibold">예상 비용</span>
            <span className="font-bold text-primary-600">
              {sendInfo.estimatedCost.toLocaleString()}원
            </span>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            {sendInfo.sendMode === "IMMEDIATE"
              ? "발송 후에는 취소할 수 없습니다."
              : "예약 발송은 예약내역에서 취소 가능합니다."}
          </p>
        </div>

        <div className="flex gap-2">
          <Button onClick={onConfirm} className="flex-1">
            발송하기
          </Button>
          <Button variant="outline" onClick={onClose}>
            취소
          </Button>
        </div>
      </div>
    </Modal>
  );
}

