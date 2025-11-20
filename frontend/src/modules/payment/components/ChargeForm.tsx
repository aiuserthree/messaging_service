"use client";

import { useState } from "react";
import { Button, Input, Select, SelectOption } from "@/modules/common/ui";
import { CreditCard, Building2, Wallet } from "lucide-react";

interface ChargeFormProps {
  currentBalance: number;
}

export function ChargeForm({ currentBalance }: ChargeFormProps) {
  const [amount, setAmount] = useState<number>(50000);
  const [paymentMethod, setPaymentMethod] = useState<string>("card");
  const [customAmount, setCustomAmount] = useState<string>("");

  const presetAmounts = [50000, 100000, 300000, 500000, 1000000];

  const paymentMethods: SelectOption[] = [
    { value: "card", label: "신용카드/체크카드" },
    { value: "bank", label: "무통장입금" },
    { value: "virtual", label: "가상계좌" },
    { value: "transfer", label: "실시간 계좌이체" },
    { value: "simple", label: "간편결제" },
  ];

  const finalAmount = amount + Math.floor(amount * 0.1); // 부가세 10%

  const handleCharge = () => {
    // 결제 처리 로직
    console.log("충전:", { amount, paymentMethod, finalAmount });
    alert("충전이 완료되었습니다.");
  };

  return (
    <div className="space-y-6">
      {/* Current Balance */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-600 mb-1">현재 잔액</div>
            <div className="text-3xl font-bold text-primary-600">
              {currentBalance.toLocaleString()}원
            </div>
          </div>
          <Wallet className="h-12 w-12 text-primary-600" />
        </div>
      </div>

      {/* Amount Selection */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">충전 금액 선택</h2>
        <div className="grid grid-cols-5 gap-3 mb-4">
          {presetAmounts.map((preset) => (
            <Button
              key={preset}
              variant={amount === preset ? "primary" : "outline"}
              onClick={() => setAmount(preset)}
            >
              {preset.toLocaleString()}원
            </Button>
          ))}
        </div>
        <div className="mt-4">
          <Input
            label="직접 입력 (최소 10,000원)"
            type="number"
            value={customAmount}
            onChange={(e) => {
              const value = parseInt(e.target.value);
              if (value >= 10000) {
                setAmount(value);
                setCustomAmount(e.target.value);
              }
            }}
            placeholder="금액을 입력하세요"
          />
        </div>
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">충전 금액</span>
            <span className="font-semibold">{amount.toLocaleString()}원</span>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm text-gray-600">부가세 (10%)</span>
            <span className="font-semibold">
              {Math.floor(amount * 0.1).toLocaleString()}원
            </span>
          </div>
          <div className="flex justify-between items-center mt-2 pt-2 border-t">
            <span className="font-semibold">총 결제 금액</span>
            <span className="text-xl font-bold text-primary-600">
              {finalAmount.toLocaleString()}원
            </span>
          </div>
        </div>
      </div>

      {/* Payment Method */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">결제 수단 선택</h2>
        <Select
          options={paymentMethods}
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
        />
      </div>

      {/* Price Guide */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">요금 안내</h2>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">단문 SMS</span>
            <span className="font-medium">20원</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">장문 LMS</span>
            <span className="font-medium">50원</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">포토 MMS</span>
            <span className="font-medium">200원</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">알림톡</span>
            <span className="font-medium">30원</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">브랜드톡</span>
            <span className="font-medium">30원</span>
          </div>
        </div>
      </div>

      {/* Charge Button */}
      <Button onClick={handleCharge} className="w-full" size="lg">
        충전하기
      </Button>
    </div>
  );
}

