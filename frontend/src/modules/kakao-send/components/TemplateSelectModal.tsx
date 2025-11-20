"use client";

import { useState, useEffect } from "react";
import { Modal, Button } from "@/modules/common/ui";
import { apiClient } from "@/modules/common/api-client/client/axiosClient";
import { FileText } from "lucide-react";

interface Template {
  id: string;
  code: string;
  name: string;
  content: string;
  status: string;
}

interface TemplateSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (template: Template) => void;
  channelId: string | null;
  sendType: "alimtalk" | "brandtalk";
}

export function TemplateSelectModal({
  isOpen,
  onClose,
  onSelect,
  channelId,
  sendType,
}: TemplateSelectModalProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasTemplate, setHasTemplate] = useState(true);

  useEffect(() => {
    if (isOpen && channelId) {
      loadTemplates();
    }
  }, [isOpen, channelId, sendType]);

  const loadTemplates = async () => {
    setIsLoading(true);
    try {
      // Mock API call
      // const response = await apiClient.get(`/kakao/templates?channelId=${channelId}&sendType=${sendType.toUpperCase()}`);
      // Mock data
      const mockTemplates: Template[] = [
        {
          id: "1",
          code: "T001",
          name: "주문 확인 알림",
          content: "주문이 확인되었습니다. #{주문번호}",
          status: sendType === "alimtalk" ? "APPROVED" : "ACTIVE",
        },
      ];
      setTemplates(mockTemplates);
      setHasTemplate(mockTemplates.length > 0);
    } catch (error) {
      console.error("템플릿 로드 실패:", error);
      setHasTemplate(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToTemplate = () => {
    const url =
      sendType === "alimtalk"
        ? "/kakao/template/alimtalk"
        : "/kakao/template/brandtalk";
    window.open(url, "_blank");
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="템플릿 선택"
      size="lg"
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : !hasTemplate || templates.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-5xl mb-4">
            {sendType === "alimtalk" ? "📋" : "💬"}
          </div>
          <h3 className="text-lg font-semibold mb-2">
            {sendType === "alimtalk"
              ? "등록된 알림톡 템플릿이 없습니다"
              : "등록된 브랜드톡 템플릿이 없습니다"}
          </h3>
          <p className="text-gray-600 mb-4">
            {sendType === "alimtalk" ? (
              <>
                알림톡 발송을 위해서는 카카오톡 채널에서<br />
                템플릿을 등록하고 승인받아야 합니다.
              </>
            ) : (
              <>
                브랜드톡 발송을 위해서는 템플릿을 먼저 등록해야 합니다.<br />
                <span className="text-green-600 font-semibold">
                  ✅ 등록 즉시 사용 가능 ✅ 승인 절차 없음
                </span>
              </>
            )}
          </p>
          <Button onClick={handleGoToTemplate} className="w-full">
            템플릿 등록하러 가기
          </Button>
        </div>
      ) : (
        <div className="space-y-2 max-h-[60vh] overflow-y-auto">
          {templates.map((template) => (
            <div
              key={template.id}
              className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
              onClick={() => onSelect(template)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-gray-400" />
                    <h4 className="font-semibold">{template.name}</h4>
                    <span className="text-xs text-gray-500">
                      ({template.code})
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-gray-600">
                    {template.content}
                  </p>
                </div>
                <Button size="sm" variant="outline">
                  선택
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}

