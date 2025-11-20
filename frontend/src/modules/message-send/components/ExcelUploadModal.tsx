"use client";

import { useState } from "react";
import { Modal, Button } from "@/modules/common/ui";
import { Upload, Download } from "lucide-react";

interface ExcelUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (numbers: string[]) => void;
}

export function ExcelUploadModal({
  isOpen,
  onClose,
  onUpload,
}: ExcelUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsProcessing(true);
    // Mock processing - 실제로는 xlsx 라이브러리로 파싱
    setTimeout(() => {
      // Mock numbers
      const mockNumbers = [
        "010-1234-5678",
        "010-2345-6789",
        "010-3456-7890",
      ];
      onUpload(mockNumbers);
      setIsProcessing(false);
      setFile(null);
      onClose();
    }, 1000);
  };

  const handleDownloadSample = () => {
    // Mock sample download
    alert("샘플 파일 다운로드");
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="엑셀 업로드" size="md">
      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-600 mb-2">
            지원 형식: .xlsx, .xls, .csv (최대 10MB, 최대 10,000건)
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadSample}
            className="mb-4"
          >
            <Download className="h-4 w-4 mr-2" />
            샘플 다운로드
          </Button>
        </div>

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-sm text-gray-600 mb-4">
            파일을 드래그하여 놓거나 클릭하여 선택하세요
          </p>
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileSelect}
            className="hidden"
            id="excel-upload"
          />
          <label htmlFor="excel-upload">
            <Button variant="outline" as="span">
              파일 선택
            </Button>
          </label>
          {file && (
            <p className="mt-4 text-sm text-gray-700">{file.name}</p>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleUpload}
            disabled={!file || isProcessing}
            className="flex-1"
          >
            {isProcessing ? "처리 중..." : "업로드"}
          </Button>
          <Button variant="outline" onClick={onClose}>
            취소
          </Button>
        </div>
      </div>
    </Modal>
  );
}

