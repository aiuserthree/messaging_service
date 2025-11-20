"use client";

import { useState } from "react";
import { Button, Input, Select, SelectOption, Textarea, Modal } from "@/modules/common/ui";
import { Plus, Edit, Trash2, FileText } from "lucide-react";

interface Template {
  id: string;
  name: string;
  category: string;
  messageType: "SMS" | "LMS" | "MMS";
  content: string;
  title?: string;
  createdAt: Date;
}

export function MessageTemplateManage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");

  const messageTypes: SelectOption[] = [
    { value: "all", label: "전체" },
    { value: "SMS", label: "SMS" },
    { value: "LMS", label: "LMS" },
    { value: "MMS", label: "MMS" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="템플릿명 또는 내용으로 검색"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select
            options={messageTypes}
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-32"
          />
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            템플릿 등록
          </Button>
        </div>
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
                <h3 className="font-semibold">{template.name}</h3>
                <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                  {template.messageType}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                {template.content}
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Edit className="h-4 w-4 mr-1" />
                  수정
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Trash2 className="h-4 w-4 mr-1" />
                  삭제
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Template Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="템플릿 등록"
        size="lg"
      >
        <div className="space-y-4">
          <Input label="템플릿명" required />
          <Select
            label="카테고리"
            options={[
              { value: "order", label: "주문" },
              { value: "delivery", label: "배송" },
              { value: "notice", label: "공지" },
            ]}
            required
          />
          <Select
            label="메시지 타입"
            options={messageTypes.filter((t) => t.value !== "all")}
            required
          />
          <Input label="제목 (LMS/MMS만)" />
          <Textarea label="메시지 내용" rows={10} required />
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

