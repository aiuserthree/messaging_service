"use client";

import { useState } from "react";
import { Button, Input, Select, SelectOption, Modal } from "@/modules/common/ui";
import { Plus, Upload, CheckCircle, XCircle, Clock } from "lucide-react";

interface CallerNumber {
  id: string;
  number: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  purpose?: string;
  has080Number?: boolean;
  registeredAt: Date;
  approvedAt?: Date;
}

export function CallerNumberManage() {
  const [callerNumbers, setCallerNumbers] = useState<CallerNumber[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newNumber, setNewNumber] = useState("");
  const [purpose, setPurpose] = useState("");

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
            승인대기
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

  const handleAdd = () => {
    // 발신번호 등록 로직
    console.log("등록:", { newNumber, purpose });
    setShowAddModal(false);
    setNewNumber("");
    setPurpose("");
  };

  return (
    <div className="space-y-6">
      {/* Add Button */}
      <div className="flex justify-end">
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          발신번호 등록
        </Button>
      </div>

      {/* Caller Numbers List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                발신번호
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                용도
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                080번호
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                상태
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                등록일
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                관리
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {callerNumbers.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                  등록된 발신번호가 없습니다.
                </td>
              </tr>
            ) : (
              callerNumbers.map((number) => (
                <tr key={number.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium">
                    {number.number}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {number.purpose || "-"}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {number.has080Number ? (
                      <span className="text-green-600">연동됨</span>
                    ) : (
                      <span className="text-gray-400">미연동</span>
                    )}
                  </td>
                  <td className="px-4 py-3">{getStatusBadge(number.status)}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {number.registeredAt.toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {number.status === "REJECTED" && (
                        <button className="text-primary-600 hover:text-primary-800 text-sm">
                          재신청
                        </button>
                      )}
                      {number.status === "PENDING" && (
                        <button className="text-gray-600 hover:text-gray-800 text-sm">
                          취소
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="발신번호 등록"
        size="md"
      >
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-sm mb-2">발신번호 사전등록제 안내</h4>
            <p className="text-xs text-gray-700">
              정보통신망법에 따라 발신번호는 사전 등록 후 승인받아야 사용할 수 있습니다.
            </p>
          </div>

          <Input
            label="발신번호"
            value={newNumber}
            onChange={(e) => setNewNumber(e.target.value)}
            placeholder="010-1234-5678"
            required
          />
          <Input
            label="용도"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            placeholder="마케팅팀, 고객센터 등"
          />

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-semibold text-sm mb-2">필수 서류</h4>
            <ul className="text-xs text-gray-700 space-y-1 list-disc list-inside">
              <li>통신서비스 이용증명원</li>
              <li>개인 회원: 본인 명의 확인 서류</li>
              <li>기업 회원: 사업자등록증, 재직증명서 추가</li>
            </ul>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleAdd} className="flex-1">
              등록하기
            </Button>
            <Button variant="outline" onClick={() => setShowAddModal(false)}>
              취소
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

