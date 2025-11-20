"use client";

import { useRouter } from "next/navigation";
import { Button, Select, SelectOption } from "@/modules/common/ui";
import { FileText } from "lucide-react";

interface TemplateCheckAlertProps {
  sendType: "alimtalk" | "brandtalk";
  onChannelSelect?: (channelId: string) => void;
}

export function TemplateCheckAlert({
  sendType,
  onChannelSelect,
}: TemplateCheckAlertProps) {
  const router = useRouter();

  const handleGoToTemplate = () => {
    const url =
      sendType === "alimtalk"
        ? "/kakao/template/alimtalk"
        : "/kakao/template/brandtalk";
    window.open(url, "_blank");
  };

  const handleGoToGuide = () => {
    router.push(`/guide/template/${sendType}`);
  };

  // Mock channels - 실제로는 API에서 가져와야 함
  const channels: SelectOption[] = [
    { value: "1", label: "채널 1" },
    { value: "2", label: "채널 2" },
  ];

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center max-w-md w-full">
        <div className="text-6xl mb-4 flex justify-center">
          {sendType === "alimtalk" ? "📋" : "💬"}
        </div>

        <h2 className="text-2xl font-bold mb-4">
          {sendType === "alimtalk"
            ? "등록된 알림톡 템플릿이 없습니다"
            : "등록된 브랜드톡 템플릿이 없습니다"}
        </h2>

        {/* Channel Select */}
        <div className="mb-6">
          <Select
            label="발신 채널 선택"
            options={channels}
            placeholder="채널을 선택하세요"
            onChange={(e) => onChannelSelect?.(e.target.value)}
          />
        </div>

        <div className="text-gray-600 mb-6 space-y-2">
          {sendType === "alimtalk" ? (
            <>
              <p>알림톡 발송을 위해서는 카카오톡 채널에서</p>
              <p>템플릿을 등록하고 승인받아야 합니다.</p>
              <p className="mt-4 text-sm">
                템플릿 등록 후 1~2 영업일 내 승인됩니다.
              </p>
            </>
          ) : (
            <>
              <p>브랜드톡 발송을 위해서는 템플릿을 먼저 등록해야 합니다.</p>
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="font-semibold mb-2">템플릿 유형:</p>
                <p className="text-sm">
                  기본형, 강조형, 이미지형, 와이드형, 캐러셀형
                </p>
              </div>
              <div className="mt-4 space-y-1">
                <p className="text-green-600">✅ 템플릿 등록 즉시 사용 가능</p>
                <p className="text-green-600">✅ 승인 절차 없이 바로 발송</p>
              </div>
            </>
          )}
        </div>

        <div className="space-y-3">
          <Button onClick={handleGoToTemplate} size="lg" className="w-full">
            템플릿 등록하러 가기
          </Button>

          <button
            onClick={handleGoToGuide}
            className="text-blue-600 hover:underline text-sm"
          >
            템플릿 등록 가이드 보기 &gt;
          </button>
        </div>
      </div>
    </div>
  );
}

