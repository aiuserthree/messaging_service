"use client";

import { useState } from "react";
import { Button, Input, Select, SelectOption, Textarea, Modal } from "@/modules/common/ui";
import { Plus, CheckCircle, XCircle } from "lucide-react";

interface BrandtalkTemplate {
  id: string;
  code: string;
  name: string;
  type: "BASIC" | "HIGHLIGHT" | "IMAGE" | "WIDE" | "CAROUSEL";
  content: string;
  status: "ACTIVE" | "INACTIVE";
}

export function BrandtalkTemplateManage() {
  const [templates, setTemplates] = useState<BrandtalkTemplate[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);

  const templateTypes: SelectOption[] = [
    { value: "BASIC", label: "기본형" },
    { value: "HIGHLIGHT", label: "강조형" },
    { value: "IMAGE", label: "이미지형" },
    { value: "WIDE", label: "와이드형" },
    { value: "CAROUSEL", label: "캐러셀형" },
  ];

  return (
    <div className="space-y-6">
      {/* Info Alert */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h4 className="font-semibold text-sm mb-2">브랜드톡 템플릿 안내</h4>
        <ul className="text-xs text-gray-700 space-y-1 list-disc list-inside">
          <li>템플릿 등록 즉시 사용 가능합니다</li>
          <li>승인 절차 없이 바로 발송할 수 있습니다</li>
          <li>다양한 템플릿 유형을 선택할 수 있습니다</li>
        </ul>
      </div>

      {/* Header */}
      <div className="flex justify-end">
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          템플릿 등록
        </Button>
      </div>

      {/* Template List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            등록된 템플릿이 없습니다.
          </div>
        ) : (
          templates.map((template) => (
            <div
              key={template.id}
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold">{template.name}</h3>
                  <p className="text-xs text-gray-500">{template.code}</p>
                </div>
                <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                  {templateTypes.find((t) => t.value === template.type)?.label}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                {template.content}
              </p>
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    template.status === "ACTIVE"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {template.status === "ACTIVE" ? "활성" : "비활성"}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Template Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="브랜드톡 템플릿 등록"
        size="lg"
      >
        <div className="space-y-4">
          <Input label="템플릿 코드" required />
          <Input label="템플릿명" required />
          <Select
            label="템플릿 유형"
            options={templateTypes}
            required
          />
          <Textarea label="메시지 내용" rows={10} required />
          <Input label="이미지 (이미지형/와이드형)" type="file" accept="image/*" />
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-xs text-green-800">
              브랜드톡 템플릿은 등록 즉시 사용 가능합니다.
            </p>
          </div>
          <div className="flex gap-2">
            <Button className="flex-1">저장</Button>
            <Button variant="outline" onClick={() => setShowAddModal(false)}>
              취소
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

