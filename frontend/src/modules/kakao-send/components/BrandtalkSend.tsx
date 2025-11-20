"use client";

import { useState } from "react";
import { Button, Select, SelectOption, Textarea, Input } from "@/modules/common/ui";
import { TemplateSelectModal } from "./TemplateSelectModal";

interface BrandtalkSendProps {
  onChannelSelect?: (channelId: string) => void;
  selectedChannelId: string | null;
}

export function BrandtalkSend({
  onChannelSelect,
  selectedChannelId,
}: BrandtalkSendProps) {
  const [templateId, setTemplateId] = useState<string | null>(null);
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [recipientNumbers, setRecipientNumbers] = useState<string[]>([]);
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  // Mock channels
  const channels: SelectOption[] = [
    { value: "1", label: "채널 1" },
    { value: "2", label: "채널 2" },
  ];

  const handleSend = async () => {
    // 발송 로직
    console.log("브랜드톡 발송", {
      channelId: selectedChannelId,
      templateId,
      variables,
      recipientNumbers,
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-6">
        {/* Channel Select */}
        <Select
          label="브랜드 채널"
          options={channels}
          placeholder="브랜드 채널을 선택하세요"
          value={selectedChannelId || ""}
          onChange={(e) => onChannelSelect?.(e.target.value)}
          required
        />

        {/* Template Select */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            템플릿 선택
          </label>
          <Button
            variant="outline"
            onClick={() => setShowTemplateModal(true)}
            className="w-full"
          >
            템플릿 선택
          </Button>
        </div>

        {/* Variables */}
        {templateId && (
          <div className="space-y-4">
            <h3 className="font-semibold">변수 입력</h3>
            <Input
              label="변수 1"
              value={variables["변수1"] || ""}
              onChange={(e) =>
                setVariables({ ...variables, 변수1: e.target.value })
              }
            />
          </div>
        )}

        {/* Recipient Numbers */}
        <div>
          <Textarea
            label="수신번호"
            placeholder="전화번호를 입력하세요 (콤마 또는 엔터로 구분)"
            rows={5}
            value={recipientNumbers.join("\n")}
            onChange={(e) => {
              const numbers = e.target.value
                .split(/[,\n]/)
                .map((n) => n.trim())
                .filter((n) => n);
              setRecipientNumbers(numbers);
            }}
          />
          <p className="mt-1 text-sm text-gray-500">
            총 {recipientNumbers.length}명
          </p>
        </div>

        {/* Send Button */}
        <Button
          onClick={handleSend}
          className="w-full"
          disabled={!templateId || recipientNumbers.length === 0}
        >
          발송하기
        </Button>
      </div>

      {/* Preview */}
      <div className="lg:sticky lg:top-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold mb-4">미리보기</h3>
          <div className="border rounded-lg p-4 bg-gray-50">
            <p className="text-sm text-gray-600">템플릿을 선택하면 미리보기가 표시됩니다.</p>
          </div>
        </div>
      </div>

      {/* Template Select Modal */}
      <TemplateSelectModal
        isOpen={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        onSelect={(template) => {
          setTemplateId(template.id);
          setShowTemplateModal(false);
        }}
        channelId={selectedChannelId}
        sendType="brandtalk"
      />
    </div>
  );
}

