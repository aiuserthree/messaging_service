"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/modules/auth/stores/authStore";
import { GeneralMessageSend } from "@/modules/message-send/components/GeneralMessageSend";
import { AdMessageSend } from "@/modules/message-send/components/AdMessageSend";
import { ElectionMessageSend } from "@/modules/message-send/components/ElectionMessageSend";
import { Button } from "@/modules/common/ui";
import { useEffect } from "react";

export default function MessageSendPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sendType = (searchParams.get("type") || "general") as
    | "general"
    | "ad"
    | "election";
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  const getPageTitle = () => {
    switch (sendType) {
      case "general":
        return "일반문자 발송";
      case "ad":
        return "광고문자 발송";
      case "election":
        return "공직선거문자 발송";
      default:
        return "문자 발송";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {getPageTitle()}
              </h1>
              <div className="mt-2 flex gap-2">
                <Button
                  variant={sendType === "general" ? "primary" : "outline"}
                  size="sm"
                  onClick={() => router.push("/message/send?type=general")}
                >
                  일반문자
                </Button>
                <Button
                  variant={sendType === "ad" ? "primary" : "outline"}
                  size="sm"
                  onClick={() => router.push("/message/send?type=ad")}
                >
                  광고문자
                </Button>
                <Button
                  variant={sendType === "election" ? "primary" : "outline"}
                  size="sm"
                  onClick={() => router.push("/message/send?type=election")}
                >
                  공직선거
                </Button>
              </div>
            </div>
            <Button variant="outline" onClick={() => router.push("/dashboard")}>
              대시보드로
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {sendType === "general" && <GeneralMessageSend />}
        {sendType === "ad" && <AdMessageSend />}
        {sendType === "election" && <ElectionMessageSend />}
      </main>
    </div>
  );
}

