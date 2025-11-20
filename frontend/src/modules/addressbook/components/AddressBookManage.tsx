"use client";

import { useState } from "react";
import { Button, Input, Select, SelectOption, Modal } from "@/modules/common/ui";
import { Plus, Upload, Download, Search, Users } from "lucide-react";

interface Address {
  id: string;
  name: string;
  phoneNumber: string;
  group: string;
  email?: string;
  memo?: string;
  createdAt: Date;
}

export function AddressBookManage() {
  const [selectedGroup, setSelectedGroup] = useState<string>("all");
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  // Mock groups
  const groups: SelectOption[] = [
    { value: "all", label: "전체" },
    { value: "group1", label: "VIP 고객" },
    { value: "group2", label: "일반 고객" },
  ];

  return (
    <div className="flex gap-6">
      {/* Sidebar - Groups */}
      <aside className="w-64 bg-white rounded-lg shadow p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold">그룹</h2>
          <Button size="sm" variant="outline">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-y-2">
          {groups.map((group) => (
            <button
              key={group.value}
              onClick={() => setSelectedGroup(group.value)}
              className={`w-full text-left px-3 py-2 rounded ${
                selectedGroup === group.value
                  ? "bg-primary-100 text-primary-700"
                  : "hover:bg-gray-100"
              }`}
            >
              {group.label}
            </button>
          ))}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-white rounded-lg shadow p-6">
        {/* Header Actions */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="이름 또는 전화번호로 검색"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowAddModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              주소 추가
            </Button>
            <Button variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              엑셀 업로드
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              엑셀 다운로드
            </Button>
            <Button>
              <Users className="h-4 w-4 mr-2" />
              문자 보내기
            </Button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-sm text-gray-600">전체 주소</div>
            <div className="text-2xl font-bold">0</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-sm text-gray-600">그룹 수</div>
            <div className="text-2xl font-bold">{groups.length - 1}</div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="text-sm text-gray-600">정상 주소</div>
            <div className="text-2xl font-bold">0</div>
          </div>
          <div className="bg-red-50 rounded-lg p-4">
            <div className="text-sm text-gray-600">수신거부</div>
            <div className="text-2xl font-bold">0</div>
          </div>
        </div>

        {/* Address List */}
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  <input type="checkbox" />
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  이름
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  전화번호
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  그룹
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  이메일
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
              {addresses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                    등록된 주소록이 없습니다.
                  </td>
                </tr>
              ) : (
                addresses.map((address) => (
                  <tr key={address.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <input type="checkbox" />
                    </td>
                    <td className="px-4 py-3 text-sm">{address.name}</td>
                    <td className="px-4 py-3 text-sm">{address.phoneNumber}</td>
                    <td className="px-4 py-3 text-sm">{address.group}</td>
                    <td className="px-4 py-3 text-sm">{address.email || "-"}</td>
                    <td className="px-4 py-3 text-sm">
                      {address.createdAt.toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button className="text-primary-600 hover:text-primary-800 text-sm">
                          수정
                        </button>
                        <button className="text-red-600 hover:text-red-800 text-sm">
                          삭제
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* Add Address Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="주소 추가"
      >
        <div className="space-y-4">
          <Input label="이름" required />
          <Input label="전화번호" required placeholder="010-1234-5678" />
          <Select
            label="그룹"
            options={groups.filter((g) => g.value !== "all")}
            required
          />
          <Input label="이메일" type="email" />
          <Input label="메모" />
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

