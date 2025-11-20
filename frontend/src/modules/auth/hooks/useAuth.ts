import { useRouter } from "next/navigation";
import { useAuthStore } from "../stores/authStore";
import { apiClient } from "@/modules/common/api-client/client/axiosClient";
import { useApiMutation } from "@/modules/common/api-client/hooks/useApi";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: {
    id: string;
    email: string;
    name: string;
    memberType: "PERSONAL" | "BUSINESS";
    balance: number;
  };
  token: string;
}

export function useAuth() {
  const router = useRouter();
  const { user, token, setUser, setToken, clearAuth, isAuthenticated } =
    useAuthStore();

  const loginMutation = useApiMutation<LoginResponse, LoginRequest>(
    "/auth/login",
    "POST"
  );

  const login = async (email: string, password: string) => {
    const result = await loginMutation.mutateAsync({ email, password });
    if (result) {
      setUser(result.user);
      setToken(result.token);
      apiClient.setAuthToken(result.token);
      router.push("/dashboard");
    }
    return result;
  };

  const logout = () => {
    clearAuth();
    apiClient.clearAuthToken();
    router.push("/login");
  };

  return {
    user,
    token,
    isAuthenticated,
    login,
    logout,
    isLoading: loginMutation.isPending,
    error: loginMutation.error,
  };
}

