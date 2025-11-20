"use client";

import { useState } from "react";
import { useAuthStore } from "@/modules/auth/stores/authStore";
import { Button, Input, Select, SelectOption } from "@/modules/common/ui";
import { Building2, User } from "lucide-react";
import { useRouter } from "next/navigation";

export function ProfileEdit() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [detailAddress, setDetailAddress] = useState("");

  const handleSave = () => {
    // 저장 로직
    console.log("저장:", { name, email, phone, address, detailAddress });
    alert("정보가 수정되었습니다.");
  };

  return (
    <div className="space-y-6">
      {/* Member Type Badge */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-2 mb-6">
          {user?.memberType === "BUSINESS" ? (
            <Building2 className="h-5 w-5 text-primary-600" />
          ) : (
            <User className="h-5 w-5 text-primary-600" />
          )}
          <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
            {user?.memberType === "BUSINESS" ? "기업 회원" : "개인 회원"}
          </span>
          {user?.memberType === "PERSONAL" && (
            <Button variant="outline" size="sm" className="ml-auto">
              사업자 회원으로 전환
            </Button>
          )}
        </div>

        {/* Profile Form */}
        <div className="space-y-4">
          <Input
            label="아이디"
            value={user?.email || ""}
            disabled
            className="bg-gray-50"
          />
          <Input
            label="이름"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            label="휴대폰번호"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="010-1234-5678"
            required
          />
          <Input
            label="이메일"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <div className="grid grid-cols-3 gap-2">
            <Input
              label="우편번호"
              value=""
              placeholder="우편번호"
              className="col-span-1"
            />
            <Button variant="outline" className="col-span-2 self-end">
              주소 검색
            </Button>
          </div>
          <Input
            label="주소"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            disabled
            className="bg-gray-50"
          />
          <Input
            label="상세주소"
            value={detailAddress}
            onChange={(e) => setDetailAddress(e.target.value)}
          />
        </div>

        <div className="mt-6 flex gap-2">
          <Button onClick={handleSave} className="flex-1">
            저장하기
          </Button>
          <Button variant="outline" onClick={() => router.push("/dashboard")}>
            취소
          </Button>
        </div>
      </div>

      {/* Password Change */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">비밀번호 변경</h2>
        <div className="space-y-4">
          <Input
            label="현재 비밀번호"
            type="password"
            required
          />
          <Input
            label="새 비밀번호"
            type="password"
            required
          />
          <Input
            label="새 비밀번호 확인"
            type="password"
            required
          />
          <Button>비밀번호 변경</Button>
        </div>
      </div>
    </div>
  );
}

