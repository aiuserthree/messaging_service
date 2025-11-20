import { useState, useEffect } from "react";
import { apiClient } from "@/modules/common/api-client/client/axiosClient";

interface TemplateCheckResult {
  hasTemplate: boolean;
  templateCount: number;
  message?: string;
}

export function useTemplateCheck(
  channelId: string | null,
  sendType: "alimtalk" | "brandtalk"
) {
  const [hasTemplate, setHasTemplate] = useState(false);
  const [templateCount, setTemplateCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkTemplate = async () => {
    if (!channelId) {
      setHasTemplate(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.get<TemplateCheckResult>(
        "/kakao/templates/check",
        {
          params: {
            channelId,
            sendType: sendType.toUpperCase(),
          },
        }
      );

      if (response.success) {
        setHasTemplate(response.data.hasTemplate);
        setTemplateCount(response.data.templateCount);
      } else {
        setError(response.error?.message || "템플릿 확인 실패");
        setHasTemplate(false);
      }
    } catch (err) {
      setError("템플릿 확인 중 오류가 발생했습니다.");
      setHasTemplate(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (channelId) {
      checkTemplate();
    }
  }, [channelId, sendType]);

  return {
    hasTemplate,
    templateCount,
    isLoading,
    error,
    checkTemplate,
  };
}

