"use client";

import { useState } from "react";
import { Button, Input, Textarea, Select, SelectOption } from "@/modules/common/ui";
import { Upload, FileText, Users } from "lucide-react";

export function AddressAdd() {
  const [inputMode, setInputMode] = useState<"DIRECT" | "EXCEL" | "PASTE">("DIRECT");
  const [addresses, setAddresses] = useState<Array<{ name: string; phone: string }>>([]);

  const groups: SelectOption[] = [
    { value: "group1", label: "VIP 고객" },
    { value: "group2", label: "일반 고객" },
  ];

  const handleDirectInput = (value: string) => {
    // 직접 입력 처리
    const lines = value.split("\n");
    const newAddresses = lines
      .map((line) => {
        const parts = line.split(/\s+/);
        if (parts.length >= 2) {
          return {
            name: parts[0],
            phone: parts[1].replace(/[^0-9]/g, "").replace(/(\d{3})(\d{4})(\d{4})/, "$1-$2-$3"),
          };
        }
        return null;
      })
      .filter((addr) => addr !== null) as Array<{ name: string; phone: string }>;
    
    setAddresses([...addresses, ...newAddresses]);
  };

  return (
    <div className="space-y-6">
      {/* Input Mode Tabs */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex gap-2 mb-6">
          <Button
            variant={inputMode === "DIRECT" ? "primary" : "outline"}
            onClick={() => setInputMode("DIRECT")}
          >
            <Users className="h-4 w-4 mr-2" />
            직접 입력
          </Button>
          <Button
            variant={inputMode === "EXCEL" ? "primary" : "outline"}
            onClick={() => setInputMode("EXCEL")}
          >
            <Upload className="h-4 w-4 mr-2" />
            엑셀 업로드
          </Button>
          <Button
            variant={inputMode === "PASTE" ? "primary" : "outline"}
            onClick={() => setInputMode("PASTE")}
          >
            <FileText className="h-4 w-4 mr-2" />
            텍스트 붙여넣기
          </Button>
        </div>

        {inputMode === "DIRECT" && (
          <div className="space-y-4">
            <Input label="이름" required />
            <Input label="전화번호" required placeholder="010-1234-5678" />
            <Select label="그룹" options={groups} required />
            <Input label="이메일" type="email" />
            <Input label="메모" />
            <Button className="w-full">추가</Button>
          </div>
        )}

        {inputMode === "EXCEL" && (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-sm text-gray-600 mb-4">
                엑셀 파일을 업로드하세요
              </p>
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                id="excel-upload"
              />
              <label htmlFor="excel-upload">
                <Button variant="outline" as="span">
                  파일 선택
                </Button>
              </label>
            </div>
          </div>
        )}

        {inputMode === "PASTE" && (
          <div className="space-y-4">
            <Textarea
              label="텍스트 붙여넣기"
              placeholder="이름 전화번호 형식으로 입력하세요 (엔터로 구분)"
              rows={10}
              onChange={(e) => handleDirectInput(e.target.value)}
            />
            <p className="text-xs text-gray-500">
              예: 홍길동 010-1234-5678
            </p>
          </div>
        )}
      </div>

      {/* Address List Preview */}
      {addresses.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold mb-4">추가될 주소 ({addresses.length}개)</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {addresses.map((addr, idx) => (
              <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="text-sm">{addr.name} - {addr.phone}</span>
                <button
                  onClick={() => {
                    const newAddresses = [...addresses];
                    newAddresses.splice(idx, 1);
                    setAddresses(newAddresses);
                  }}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  삭제
                </button>
              </div>
            ))}
          </div>
          <Button className="w-full mt-4">주소록에 추가</Button>
        </div>
      )}
    </div>
  );
}

