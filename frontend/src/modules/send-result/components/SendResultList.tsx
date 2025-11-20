"use client";

import { useState } from "react";
import { Button, Select, SelectOption, Input } from "@/modules/common/ui";
import { Download, RefreshCw, Eye } from "lucide-react";

interface SendResult {
  id: string;
  sendDate: Date;
  callerNumber: string;
  messageType: string;
  recipientCount: number;
  successCount: number;
  failCount: number;
  status: string;
  cost: number;
}

export function SendResultList() {
  const [messageType, setMessageType] = useState<string>("all");
  const [results, setResults] = useState<SendResult[]>([]);
  const [dateRange, setDateRange] = useState({
    start: "",
    end: "",
  });

  const messageTypes: SelectOption[] = [
    { value: "all", label: "전체" },
    { value: "SMS", label: "SMS" },
    { value: "LMS", label: "LMS" },
    { value: "MMS", label: "MMS" },
    { value: "ALIMTALK", label: "알림톡" },
    { value: "BRANDTALK", label: "브랜드톡" },
  ];

  return (
    <div className="space-y-6">
      {/* Statistics Dashboard */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-2">오늘 발송</div>
          <div className="text-3xl font-bold">0건</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-2">이번 달 발송</div>
          <div className="text-3xl font-bold">0건</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-2">성공률</div>
          <div className="text-3xl font-bold">0%</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-2">사용 포인트</div>
          <div className="text-3xl font-bold">0원</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Select
            label="메시지 타입"
            options={messageTypes}
            value={messageType}
            onChange={(e) => setMessageType(e.target.value)}
          />
          <Input
            label="시작일"
            type="date"
            value={dateRange.start}
            onChange={(e) =>
              setDateRange({ ...dateRange, start: e.target.value })
            }
          />
          <Input
            label="종료일"
            type="date"
            value={dateRange.end}
            onChange={(e) =>
              setDateRange({ ...dateRange, end: e.target.value })
            }
          />
          <div className="flex items-end gap-2">
            <Button className="flex-1">조회</Button>
            <Button variant="outline">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Results List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="font-semibold">발송 내역</h2>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            엑셀 다운로드
          </Button>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                발송일시
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                발신번호
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                타입
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                수신자
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                성공/실패
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                상태
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                비용
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                관리
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {results.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-gray-500">
                  발송 내역이 없습니다.
                </td>
              </tr>
            ) : (
              results.map((result) => (
                <tr key={result.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">
                    {result.sendDate.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm">{result.callerNumber}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                      {result.messageType}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">{result.recipientCount}명</td>
                  <td className="px-4 py-3 text-sm">
                    <span className="text-green-600">{result.successCount}</span> /{" "}
                    <span className="text-red-600">{result.failCount}</span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        result.status === "완료"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {result.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {result.cost.toLocaleString()}원
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button className="text-primary-600 hover:text-primary-800 text-sm">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="text-blue-600 hover:text-blue-800 text-sm">
                        재발송
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

