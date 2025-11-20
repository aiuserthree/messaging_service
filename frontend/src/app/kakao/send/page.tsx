"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/modules/auth/stores/authStore";
import { AlimtalkSend } from "@/modules/kakao-send/components/AlimtalkSend";
import { BrandtalkSend } from "@/modules/kakao-send/components/BrandtalkSend";
import { TemplateCheckAlert } from "@/modules/kakao-send/components/TemplateCheckAlert";
import { useTemplateCheck } from "@/modules/kakao-send/hooks/useTemplateCheck";
import { Button } from "@/modules/common/ui";

export default function KakaoSendPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sendType = (searchParams.get("type") || "alimtalk") as
    | "alimtalk"
    | "brandtalk";
  const { isAuthenticated } = useAuthStore();
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(
    null
  );
  const { hasTemplate, isLoading, checkTemplate } = useTemplateCheck(
    selectedChannelId,
    sendType
  );

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (selectedChannelId) {
      checkTemplate();
    }
  }, [selectedChannelId, sendType]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {sendType === "alimtalk" ? "알림톡 발송" : "브랜드톡 발송"}
              </h1>
              <div className="mt-2 flex gap-2">
                <Button
                  variant={sendType === "alimtalk" ? "primary" : "outline"}
                  size="sm"
                  onClick={() => router.push("/kakao/send?type=alimtalk")}
                >
                  알림톡
                </Button>
                <Button
                  variant={sendType === "brandtalk" ? "primary" : "outline"}
                  size="sm"
                  onClick={() => router.push("/kakao/send?type=brandtalk")}
                >
                  브랜드톡
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
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : !hasTemplate && selectedChannelId ? (
          <TemplateCheckAlert
            sendType={sendType}
            onChannelSelect={setSelectedChannelId}
          />
        ) : (
          <div>
            {sendType === "alimtalk" ? (
              <AlimtalkSend
                onChannelSelect={setSelectedChannelId}
                selectedChannelId={selectedChannelId}
              />
            ) : (
              <BrandtalkSend
                onChannelSelect={setSelectedChannelId}
                selectedChannelId={selectedChannelId}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
}

