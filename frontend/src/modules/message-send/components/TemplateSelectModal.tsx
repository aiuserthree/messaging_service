"use client";

import { Modal, Button } from "@/modules/common/ui";
import { FileText } from "lucide-react";

interface Template {
  id: string;
  name: string;
  content: string;
  title?: string;
  messageType: "SMS" | "LMS" | "MMS";
}

interface TemplateSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (template: Template) => void;
}

export function TemplateSelectModal({
  isOpen,
  onClose,
  onSelect,
}: TemplateSelectModalProps) {
  // Mock templates
  const templates: Template[] = [
    {
      id: "1",
      name: "주문 확인 알림",
      content: "주문이 확인되었습니다. 주문번호: #{주문번호}",
      messageType: "SMS",
    },
    {
      id: "2",
      name: "배송 안내",
      content: "배송이 시작되었습니다. 운송장번호: #{운송장번호}",
      title: "배송 안내",
      messageType: "LMS",
    },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="템플릿 선택" size="lg">
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
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                    {template.messageType}
                  </span>
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  {template.content.substring(0, 100)}
                  {template.content.length > 100 && "..."}
                </p>
              </div>
              <Button size="sm" variant="outline">
                선택
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
}

