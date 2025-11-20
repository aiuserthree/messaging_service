import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";

export interface RequestConfig {
  headers?: Record<string, string>;
  params?: Record<string, any>;
  timeout?: number;
  retry?: number;
  skipAuth?: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  error?: ApiError;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

class APIClient {
  private client: AxiosInstance;
  private authToken: string | null = null;

  constructor(baseURL: string) {
    this.client = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.setupInterceptors();
  }

  async get<T>(url: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.get<T>(url, this.buildConfig(config));
      return this.transformResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async post<T>(
    url: string,
    data?: any,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.post<T>(
        url,
        data,
        this.buildConfig(config)
      );
      return this.transformResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async put<T>(
    url: string,
    data?: any,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.put<T>(
        url,
        data,
        this.buildConfig(config)
      );
      return this.transformResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async patch<T>(
    url: string,
    data?: any,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.patch<T>(
        url,
        data,
        this.buildConfig(config)
      );
      return this.transformResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async delete<T>(url: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.delete<T>(url, this.buildConfig(config));
      return this.transformResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async upload(
    url: string,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse> {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await this.client.post(url, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(progress);
          }
        },
      });
      return this.transformResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  setAuthToken(token: string): void {
    this.authToken = token;
    if (typeof window !== "undefined") {
      localStorage.setItem("authToken", token);
    }
  }

  clearAuthToken(): void {
    this.authToken = null;
    if (typeof window !== "undefined") {
      localStorage.removeItem("authToken");
    }
  }

  getAuthToken(): string | null {
    if (this.authToken) return this.authToken;
    if (typeof window !== "undefined") {
      return localStorage.getItem("authToken");
    }
    return null;
  }

  private setupInterceptors(): void {
    // 요청 인터셉터
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getAuthToken();
        if (token && !config.headers["skipAuth"]) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        config.headers["X-Request-ID"] = this.generateRequestId();

        return config;
      },
      (error) => Promise.reject(error)
    );

    // 응답 인터셉터
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          return this.handleUnauthorized(error);
        }

        if (error.response?.status === 429) {
          return this.handleRateLimit(error);
        }

        return Promise.reject(error);
      }
    );
  }

  private handleError(error: any): ApiResponse {
    if (error.response) {
      return {
        success: false,
        data: null as any,
        error: {
          code:
            error.response.data?.error?.code || "UNKNOWN_ERROR",
          message:
            error.response.data?.error?.message ||
            "알 수 없는 오류가 발생했습니다.",
          details: error.response.data?.error?.details,
        },
      };
    } else if (error.request) {
      return {
        success: false,
        data: null as any,
        error: {
          code: "NETWORK_ERROR",
          message: "네트워크 연결을 확인해주세요.",
        },
      };
    } else {
      return {
        success: false,
        data: null as any,
        error: {
          code: "UNKNOWN_ERROR",
          message: error.message || "알 수 없는 오류가 발생했습니다.",
        },
      };
    }
  }

  private transformResponse<T>(response: AxiosResponse<T>): ApiResponse<T> {
    return {
      success: true,
      data: response.data,
      message: (response.data as any)?.message,
    };
  }

  private buildConfig(config?: RequestConfig): AxiosRequestConfig {
    return {
      ...config,
      headers: {
        ...config?.headers,
      },
    };
  }

  private generateRequestId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private async handleUnauthorized(error: any): Promise<any> {
    this.clearAuthToken();
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }

  private async handleRateLimit(error: any): Promise<any> {
    await this.delay(1000);
    return this.client.request(error.config);
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export const apiClient = new APIClient(
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001/api/v1"
);

