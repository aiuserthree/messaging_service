"use client";

import { useAuthStore } from "@/modules/auth/stores/authStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/modules/common/ui";
import { MessageSquare, Users, FileText, CreditCard } from "lucide-react";

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated || !user) {
    return null;
  }

  const menuItems = [
    {
      title: "문자 발송",
      description: "SMS/LMS/MMS 발송",
      href: "/message/send",
      icon: MessageSquare,
      color: "bg-blue-500",
    },
    {
      title: "카카오톡 발송",
      description: "알림톡/브랜드톡 발송",
      href: "/kakao/send",
      icon: MessageSquare,
      color: "bg-yellow-500",
    },
    {
      title: "주소록 관리",
      description: "수신자 주소록 관리",
      href: "/addressbook",
      icon: Users,
      color: "bg-green-500",
    },
    {
      title: "발송 결과",
      description: "발송 내역 및 통계",
      href: "/send-result",
      icon: FileText,
      color: "bg-purple-500",
    },
    {
      title: "충전하기",
      description: "포인트 충전",
      href: "/payment/charge",
      icon: CreditCard,
      color: "bg-orange-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              메시징 서비스
            </h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {user.name}님 ({user.memberType === "PERSONAL" ? "개인" : "기업"})
              </span>
              <span className="text-sm font-semibold text-primary-600">
                잔액: {user.balance.toLocaleString()}원
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start">
                  <div className={`${item.color} p-3 rounded-lg`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-sm text-gray-600">
                      {item.description}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}

