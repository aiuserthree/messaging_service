"use client";

import { useState } from "react";
import { Button, Select, SelectOption, Textarea, Input, Modal } from "@/modules/common/ui";
import { TemplateSelectModal } from "./TemplateSelectModal";
import { ExcelUploadModal } from "./ExcelUploadModal";
import { SendConfirmModal } from "./SendConfirmModal";
import { Phone, FileText, Users, Upload } from "lucide-react";

export function GeneralMessageSend() {
  const [callerNumber, setCallerNumber] = useState<string>("");
  const [recipientNumbers, setRecipientNumbers] = useState<string[]>([]);
  const [messageType, setMessageType] = useState<"SMS" | "LMS" | "MMS">("SMS");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [sendMode, setSendMode] = useState<"IMMEDIATE" | "SCHEDULED">("IMMEDIATE");
  const [scheduledAt, setScheduledAt] = useState<Date | null>(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showExcelModal, setShowExcelModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [inputMode, setInputMode] = useState<"DIRECT" | "ADDRESS_BOOK" | "EXCEL">("DIRECT");

  // Mock caller numbers
  const callerNumbers: SelectOption[] = [
    { value: "010-1234-5678", label: "010-1234-5678 (마케팅팀)" },
    { value: "02-1234-5678", label: "02-1234-5678 (고객센터)" },
  ];

  const calculateByteCount = (text: string): number => {
    let byteCount = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charAt(i);
      byteCount += char.charCodeAt(0) > 127 ? 2 : 1;
    }
    return byteCount;
  };

  const byteCount = calculateByteCount(content);
  const maxBytes = messageType === "SMS" ? 90 : 2000;

  const handleContentChange = (value: string) => {
    setContent(value);
    const bytes = calculateByteCount(value);
    if (bytes > 90 && messageType === "SMS") {
      setMessageType("LMS");
    }
  };

  const handleRecipientInput = (value: string) => {
    const numbers = value
      .split(/[,\n]/)
      .map((n) => n.trim().replace(/[^0-9]/g, ""))
      .filter((n) => n.length === 11 && n.startsWith("010"));
    
    const formatted = numbers.map((n) => 
      n.replace(/(\d{3})(\d{4})(\d{4})/, "$1-$2-$3")
    );
    
    setRecipientNumbers([...new Set([...recipientNumbers, ...formatted])]);
  };

  const handleSend = () => {
    if (!callerNumber || recipientNumbers.length === 0 || !content) {
      alert("필수 항목을 입력해주세요.");
      return;
    }
    setShowConfirmModal(true);
  };

  const estimatedCost = recipientNumbers.length * (messageType === "SMS" ? 20 : messageType === "LMS" ? 50 : 200);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-6">
        {/* Caller Number */}
        <Select
          label="발신번호"
          options={callerNumbers}
          placeholder="발신번호를 선택하세요"
          value={callerNumber}
          onChange={(e) => setCallerNumber(e.target.value)}
          required
        />

        {/* Recipient Input */}
        <div className="space-y-4">
          <div className="flex gap-2">
            <Button
              variant={inputMode === "DIRECT" ? "primary" : "outline"}
              size="sm"
              onClick={() => setInputMode("DIRECT")}
            >
              직접입력
            </Button>
            <Button
              variant={inputMode === "ADDRESS_BOOK" ? "primary" : "outline"}
              size="sm"
              onClick={() => setInputMode("ADDRESS_BOOK")}
            >
              주소록
            </Button>
            <Button
              variant={inputMode === "EXCEL" ? "primary" : "outline"}
              size="sm"
              onClick={() => {
                setInputMode("EXCEL");
                setShowExcelModal(true);
              }}
            >
              엑셀 업로드
            </Button>
          </div>

          {inputMode === "DIRECT" && (
            <Textarea
              label="수신번호"
              placeholder="전화번호를 입력하세요 (콤마 또는 엔터로 구분)"
              rows={5}
              onChange={(e) => handleRecipientInput(e.target.value)}
            />
          )}

          {inputMode === "ADDRESS_BOOK" && (
            <div className="border rounded-lg p-4">
              <Button variant="outline" className="w-full">
                <Users className="h-4 w-4 mr-2" />
                주소록에서 선택
              </Button>
            </div>
          )}

          {recipientNumbers.length > 0 && (
            <div className="border rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">수신번호 목록</span>
                <span className="text-sm text-gray-600">
                  총 {recipientNumbers.length}명
                </span>
              </div>
              <div className="max-h-40 overflow-y-auto space-y-1">
                {recipientNumbers.slice(0, 10).map((num, idx) => (
                  <div key={idx} className="flex justify-between items-center text-sm">
                    <span>{num}</span>
                    <button
                      onClick={() => {
                        const newNumbers = [...recipientNumbers];
                        newNumbers.splice(idx, 1);
                        setRecipientNumbers(newNumbers);
                      }}
                      className="text-red-600 hover:text-red-800"
                    >
                      삭제
                    </button>
                  </div>
                ))}
                {recipientNumbers.length > 10 && (
                  <p className="text-xs text-gray-500">
                    외 {recipientNumbers.length - 10}개...
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Message Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            메시지 타입
          </label>
          <div className="flex gap-2">
            <Button
              variant={messageType === "SMS" ? "primary" : "outline"}
              size="sm"
              onClick={() => setMessageType("SMS")}
            >
              SMS (90바이트)
            </Button>
            <Button
              variant={messageType === "LMS" ? "primary" : "outline"}
              size="sm"
              onClick={() => setMessageType("LMS")}
            >
              LMS (2,000바이트)
            </Button>
            <Button
              variant={messageType === "MMS" ? "primary" : "outline"}
              size="sm"
              onClick={() => setMessageType("MMS")}
            >
              MMS (이미지)
            </Button>
          </div>
        </div>

        {/* Message Content */}
        <div className="space-y-4">
          {messageType !== "SMS" && (
            <Input
              label="제목"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={40}
              placeholder="제목을 입력하세요"
            />
          )}

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                메시지 내용
              </label>
              <span className="text-sm text-gray-600">
                {byteCount} / {maxBytes} 바이트
              </span>
            </div>
            <Textarea
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              rows={10}
              maxLength={messageType === "SMS" ? 90 : 2000}
              placeholder="메시지 내용을 입력하세요"
            />
            <div className="flex gap-2 mt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowTemplateModal(true)}
              >
                <FileText className="h-4 w-4 mr-2" />
                템플릿 선택
              </Button>
            </div>
          </div>

          {messageType === "MMS" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                이미지 첨부 (최대 3개, 각 300KB)
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                max={3}
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  setImages(files.slice(0, 3));
                }}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
              />
              {images.length > 0 && (
                <div className="mt-2 flex gap-2">
                  {images.map((img, idx) => (
                    <div key={idx} className="relative">
                      <img
                        src={URL.createObjectURL(img)}
                        alt={`Preview ${idx + 1}`}
                        className="w-20 h-20 object-cover rounded"
                      />
                      <button
                        onClick={() => {
                          const newImages = [...images];
                          newImages.splice(idx, 1);
                          setImages(newImages);
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Send Time */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            발송 시간
          </label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="IMMEDIATE"
                checked={sendMode === "IMMEDIATE"}
                onChange={(e) => setSendMode(e.target.value as "IMMEDIATE")}
                className="mr-2"
              />
              즉시발송
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="SCHEDULED"
                checked={sendMode === "SCHEDULED"}
                onChange={(e) => setSendMode(e.target.value as "SCHEDULED")}
                className="mr-2"
              />
              예약발송
            </label>
          </div>
          {sendMode === "SCHEDULED" && (
            <div className="mt-2">
              <Input
                type="datetime-local"
                value={
                  scheduledAt
                    ? scheduledAt.toISOString().slice(0, 16)
                    : ""
                }
                onChange={(e) => setScheduledAt(new Date(e.target.value))}
              />
            </div>
          )}
        </div>

        {/* Send Button */}
        <Button onClick={handleSend} className="w-full" size="lg">
          발송하기
        </Button>
      </div>

      {/* Preview & Cost */}
      <div className="lg:sticky lg:top-6 space-y-6">
        {/* Preview */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold mb-4">메시지 미리보기</h3>
          <div className="border rounded-lg p-4 bg-gray-50">
            <div className="text-sm text-gray-600 mb-2">
              발신: {callerNumber || "발신번호 선택"}
            </div>
            {messageType !== "SMS" && title && (
              <div className="font-semibold mb-2">{title}</div>
            )}
            <div className="whitespace-pre-wrap">{content || "메시지 내용을 입력하세요"}</div>
            {images.length > 0 && (
              <div className="mt-2 flex gap-2">
                {images.map((img, idx) => (
                  <img
                    key={idx}
                    src={URL.createObjectURL(img)}
                    alt={`Preview ${idx + 1}`}
                    className="w-20 h-20 object-cover rounded"
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Cost Calculator */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold mb-4">발송 비용</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">수신자 수</span>
              <span className="font-medium">{recipientNumbers.length}명</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">메시지 타입</span>
              <span className="font-medium">{messageType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">단가</span>
              <span className="font-medium">
                {messageType === "SMS" ? 20 : messageType === "LMS" ? 50 : 200}원
              </span>
            </div>
            <div className="border-t pt-2 flex justify-between">
              <span className="font-semibold">예상 비용</span>
              <span className="font-bold text-primary-600">
                {estimatedCost.toLocaleString()}원
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <TemplateSelectModal
        isOpen={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        onSelect={(template) => {
          setContent(template.content);
          if (template.title) setTitle(template.title);
          setMessageType(template.messageType);
          setShowTemplateModal(false);
        }}
      />

      <ExcelUploadModal
        isOpen={showExcelModal}
        onClose={() => setShowExcelModal(false)}
        onUpload={(numbers) => {
          setRecipientNumbers([...new Set([...recipientNumbers, ...numbers])]);
          setShowExcelModal(false);
        }}
      />

      <SendConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={() => {
          // 발송 로직
          console.log("발송:", {
            callerNumber,
            recipientNumbers,
            messageType,
            title,
            content,
            sendMode,
            scheduledAt,
          });
          setShowConfirmModal(false);
          alert("발송이 완료되었습니다.");
        }}
        sendInfo={{
          callerNumber,
          recipientCount: recipientNumbers.length,
          messageType,
          title,
          content,
          sendMode,
          scheduledAt,
          estimatedCost,
        }}
      />
    </div>
  );
}

