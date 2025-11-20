"use client";

import { useState } from "react";
import { Button, Input, Select, SelectOption, Textarea, Modal } from "@/modules/common/ui";
import { Plus, CheckCircle, Clock, XCircle } from "lucide-react";

interface AlimtalkTemplate {
  id: string;
  code: string;
  name: string;
  content: string;
  status: "APPROVED" | "PENDING" | "REJECTED";
  approvedAt?: Date;
}

export function AlimtalkTemplateManage() {
  const [templates, setTemplates] = useState<AlimtalkTemplate[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            승인완료
          </span>
        );
      case "PENDING":
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="h-3 w-3 mr-1" />
            검수중
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="h-3 w-3 mr-1" />
            반려
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Info Alert */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-sm mb-2">알림톡 템플릿 안내</h4>
        <ul className="text-xs text-gray-700 space-y-1 list-disc list-inside">
          <li>템플릿 등록 후 카카오 검수를 받아야 합니다</li>
          <li>검수 소요 시간: 평균 1~2 영업일</li>
          <li>승인 완료된 템플릿만 발송에 사용할 수 있습니다</li>
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
                {getStatusBadge(template.status)}
              </div>
              <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                {template.content}
              </p>
              {template.status === "REJECTED" && (
                <div className="bg-red-50 border border-red-200 rounded p-2 mb-4">
                  <p className="text-xs text-red-800">반려 사유 확인</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add Template Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="알림톡 템플릿 등록"
        size="lg"
      >
        <div className="space-y-4">
          <Input label="템플릿 코드" required />
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
          <Textarea label="메시지 내용" rows={10} required />
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-xs text-yellow-800">
              템플릿 내용은 승인 후 수정할 수 없습니다. 변수만 치환 가능합니다.
            </p>
          </div>
          <div className="flex gap-2">
            <Button className="flex-1">검수 신청</Button>
            <Button variant="outline" onClick={() => setShowAddModal(false)}>
              취소
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

