# COM-M001: APIClientModule 상세 개발 설계서

## 1. 모듈 개요

### 1.1 모듈 식별 정보
- **모듈 ID**: COM-M001
- **모듈명**: APIClientModule (API 클라이언트 모듈)
- **담당 개발자**: Frontend 개발자
- **예상 개발 기간**: 5일
- **우선순위**: P0

### 1.2 모듈 목적 및 범위
- **핵심 기능**: 
  - REST API 통신을 위한 HTTP 클라이언트 제공
  - 요청/응답 인터셉터 구현
  - 에러 처리 및 재시도 로직
  - 인증 토큰 관리
  - 요청/응답 타입 안정성 보장
- **비즈니스 가치**: 모든 Frontend 모듈에서 공통으로 사용하는 API 통신 로직을 중앙화하여 일관성과 유지보수성 향상
- **제외 범위**: WebSocket 통신, GraphQL (향후 확장 가능)

### 1.3 목표 사용자
- **주 사용자 그룹**: Frontend 개발자
- **사용자 페르소나**: React/TypeScript 개발자
- **사용 시나리오**: 모든 Frontend 모듈에서 API 호출 시 사용

---

## 2. 기술 아키텍처

### 2.1 모듈 구조
```
APIClientModule/
├── client/
│   ├── axiosClient.ts        # Axios 인스턴스 설정
│   ├── interceptors.ts       # 요청/응답 인터셉터
│   └── errorHandler.ts       # 에러 처리
├── types/
│   ├── api.types.ts          # API 타입 정의
│   └── response.types.ts     # 응답 타입 정의
├── utils/
│   ├── retry.ts              # 재시도 로직
│   └── token.ts              # 토큰 관리
├── hooks/
│   └── useApi.ts             # API 호출 훅
├── tests/
│   ├── client.test.ts
│   └── interceptors.test.ts
└── index.ts                  # 모듈 진입점
```

### 2.2 기술 스택
- **프레임워크**: React 18+
- **HTTP 클라이언트**: Axios
- **타입**: TypeScript 5+
- **테스트**: Jest, React Testing Library
- **상태관리**: TanStack Query (별도 모듈)

---

## 3. 인터페이스 정의

### 3.1 외부 의존성
```typescript
interface ExternalDependencies {
  modules: [];
  apis: [
    'AuthServiceModule',      // 인증 토큰 조회
  ];
  sharedComponents: [];
  utils: [
    'UtilsModule',            // 유틸리티 함수
  ];
}
```

### 3.2 제공 인터페이스
```typescript
export interface APIClientInterface {
  // HTTP 메서드
  get: <T>(url: string, config?: RequestConfig) => Promise<ApiResponse<T>>;
  post: <T>(url: string, data?: any, config?: RequestConfig) => Promise<ApiResponse<T>>;
  put: <T>(url: string, data?: any, config?: RequestConfig) => Promise<ApiResponse<T>>;
  patch: <T>(url: string, data?: any, config?: RequestConfig) => Promise<ApiResponse<T>>;
  delete: <T>(url: string, config?: RequestConfig) => Promise<ApiResponse<T>>;
  
  // 파일 업로드
  upload: (url: string, file: File, onProgress?: (progress: number) => void) => Promise<ApiResponse>;
  
  // 토큰 관리
  setAuthToken: (token: string) => void;
  clearAuthToken: () => void;
  getAuthToken: () => string | null;
  
  // 인터셉터
  addRequestInterceptor: (interceptor: RequestInterceptor) => number;
  addResponseInterceptor: (interceptor: ResponseInterceptor) => number;
  removeInterceptor: (id: number) => void;
}

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
```

### 3.3 API 명세
```typescript
// 모든 API 엔드포인트는 다음 형식을 따름
interface APIEndpoints {
  // 예시: 문자 발송
  'POST /api/v1/messages/send': {
    request: SendMessageRequest;
    response: SendMessageResponse;
    errors: ['INSUFFICIENT_BALANCE', 'INVALID_PHONE_NUMBER', 'UNAUTHORIZED'];
  };
}
```

---

## 4. 데이터 모델

### 4.1 엔티티 정의
```typescript
// API 요청 기본 구조
interface BaseRequest {
  timestamp?: number;
  requestId?: string;
}

// API 응답 기본 구조
interface BaseResponse {
  success: boolean;
  message?: string;
  timestamp: number;
  requestId?: string;
}

// 에러 응답
interface ErrorResponse extends BaseResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
}

// 성공 응답
interface SuccessResponse<T> extends BaseResponse {
  success: true;
  data: T;
}
```

### 4.2 DTO 정의
```typescript
// 요청 DTO 예시
export class SendMessageRequestDTO {
  callerNumber: string;
  recipientNumbers: string[];
  messageType: 'SMS' | 'LMS' | 'MMS';
  content: string;
  title?: string;
  images?: File[];
  sendType: 'IMMEDIATE' | 'SCHEDULED';
  scheduledAt?: string;
}

// 응답 DTO 예시
export class SendMessageResponseDTO {
  sendId: string;
  totalCount: number;
  successCount: number;
  failCount: number;
  estimatedCost: number;
  scheduledAt?: string;
}
```

### 4.3 상태 관리 스키마
```typescript
// TanStack Query와 함께 사용
interface APIClientState {
  // 토큰 상태는 localStorage에 저장
  authToken: string | null;
  
  // 요청 중인 API 추적
  pendingRequests: Map<string, AbortController>;
  
  // 재시도 카운터
  retryCount: Map<string, number>;
}
```

---

## 5. 핵심 컴포넌트/서비스 명세

### 5.1 주요 컴포넌트 (Frontend)
```typescript
// API 클라이언트 인스턴스
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

class APIClient {
  private client: AxiosInstance;
  private authToken: string | null = null;
  
  constructor(baseURL: string) {
    this.client = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    this.setupInterceptors();
  }
  
  // GET 요청
  async get<T>(url: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.get<T>(url, this.buildConfig(config));
      return this.transformResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }
  
  // POST 요청
  async post<T>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.post<T>(url, data, this.buildConfig(config));
      return this.transformResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }
  
  // 파일 업로드
  async upload(
    url: string, 
    file: File, 
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse> {
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await this.client.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
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
  
  // 토큰 설정
  setAuthToken(token: string): void {
    this.authToken = token;
    localStorage.setItem('authToken', token);
  }
  
  // 토큰 제거
  clearAuthToken(): void {
    this.authToken = null;
    localStorage.removeItem('authToken');
  }
  
  // 인터셉터 설정
  private setupInterceptors(): void {
    // 요청 인터셉터
    this.client.interceptors.request.use(
      (config) => {
        // 인증 토큰 추가
        if (this.authToken && !config.headers['skipAuth']) {
          config.headers.Authorization = `Bearer ${this.authToken}`;
        }
        
        // 요청 ID 추가
        config.headers['X-Request-ID'] = this.generateRequestId();
        
        return config;
      },
      (error) => Promise.reject(error)
    );
    
    // 응답 인터셉터
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        // 401 에러 시 토큰 갱신 시도
        if (error.response?.status === 401) {
          return this.handleUnauthorized(error);
        }
        
        // 429 에러 시 재시도
        if (error.response?.status === 429) {
          return this.handleRateLimit(error);
        }
        
        return Promise.reject(error);
      }
    );
  }
  
  // 에러 처리
  private handleError(error: any): ApiResponse {
    if (error.response) {
      // 서버 응답 에러
      return {
        success: false,
        data: null,
        error: {
          code: error.response.data?.error?.code || 'UNKNOWN_ERROR',
          message: error.response.data?.error?.message || '알 수 없는 오류가 발생했습니다.',
          details: error.response.data?.error?.details,
        },
      };
    } else if (error.request) {
      // 네트워크 에러
      return {
        success: false,
        data: null,
        error: {
          code: 'NETWORK_ERROR',
          message: '네트워크 연결을 확인해주세요.',
        },
      };
    } else {
      // 기타 에러
      return {
        success: false,
        data: null,
        error: {
          code: 'UNKNOWN_ERROR',
          message: error.message || '알 수 없는 오류가 발생했습니다.',
        },
      };
    }
  }
  
  // 응답 변환
  private transformResponse<T>(response: AxiosResponse<T>): ApiResponse<T> {
    return {
      success: true,
      data: response.data,
      message: response.data?.message,
    };
  }
  
  // 설정 빌드
  private buildConfig(config?: RequestConfig): AxiosRequestConfig {
    return {
      ...config,
      headers: {
        ...config?.headers,
      },
    };
  }
  
  // 요청 ID 생성
  private generateRequestId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  
  // 401 에러 처리
  private async handleUnauthorized(error: any): Promise<any> {
    // 토큰 갱신 로직 (AuthServiceModule과 연동)
    // 실패 시 로그인 페이지로 리다이렉트
    window.location.href = '/login';
    return Promise.reject(error);
  }
  
  // 429 에러 처리 (재시도)
  private async handleRateLimit(error: any): Promise<any> {
    // 지수 백오프 재시도
    await this.delay(1000);
    return this.client.request(error.config);
  }
  
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// 싱글톤 인스턴스
export const apiClient = new APIClient(process.env.NEXT_PUBLIC_API_BASE_URL || '');
```

### 5.2 Custom Hook
```typescript
// useApi 훅
import { useMutation, useQuery, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { apiClient } from '../client/axiosClient';

export function useApiQuery<T>(
  key: string[],
  url: string,
  options?: UseQueryOptions<ApiResponse<T>>
) {
  return useQuery({
    queryKey: key,
    queryFn: async () => {
      const response = await apiClient.get<T>(url);
      if (!response.success) {
        throw new Error(response.error?.message || 'API 호출 실패');
      }
      return response.data;
    },
    ...options,
  });
}

export function useApiMutation<TData, TVariables>(
  url: string,
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'POST',
  options?: UseMutationOptions<ApiResponse<TData>, Error, TVariables>
) {
  return useMutation({
    mutationFn: async (variables: TVariables) => {
      let response: ApiResponse<TData>;
      
      switch (method) {
        case 'POST':
          response = await apiClient.post<TData>(url, variables);
          break;
        case 'PUT':
          response = await apiClient.put<TData>(url, variables);
          break;
        case 'PATCH':
          response = await apiClient.patch<TData>(url, variables);
          break;
        case 'DELETE':
          response = await apiClient.delete<TData>(url);
          break;
      }
      
      if (!response.success) {
        throw new Error(response.error?.message || 'API 호출 실패');
      }
      
      return response.data;
    },
    ...options,
  });
}
```

---

## 6. 이벤트 및 메시징

### 6.1 발행 이벤트
```typescript
enum APIClientEvents {
  REQUEST_START = 'api.request.start',
  REQUEST_SUCCESS = 'api.request.success',
  REQUEST_ERROR = 'api.request.error',
  TOKEN_EXPIRED = 'api.token.expired',
  NETWORK_ERROR = 'api.network.error',
}

interface EventPayload {
  eventType: APIClientEvents;
  url: string;
  method: string;
  timestamp: Date;
  data?: any;
  error?: ApiError;
}
```

### 6.2 구독 이벤트
```typescript
interface SubscribedEvents {
  'auth.token.updated': (token: string) => void;
  'auth.logout': () => void;
}
```

---

## 7. 에러 처리

### 7.1 에러 코드 정의
```typescript
enum APIClientErrorCode {
  NETWORK_ERROR = 'API_001',
  TIMEOUT_ERROR = 'API_002',
  UNAUTHORIZED = 'API_003',
  FORBIDDEN = 'API_004',
  NOT_FOUND = 'API_005',
  VALIDATION_ERROR = 'API_006',
  SERVER_ERROR = 'API_007',
  UNKNOWN_ERROR = 'API_999',
}

// 에러 코드 매핑
const ERROR_MESSAGES: Record<APIClientErrorCode, string> = {
  [APIClientErrorCode.NETWORK_ERROR]: '네트워크 연결을 확인해주세요.',
  [APIClientErrorCode.TIMEOUT_ERROR]: '요청 시간이 초과되었습니다.',
  [APIClientErrorCode.UNAUTHORIZED]: '인증이 필요합니다.',
  [APIClientErrorCode.FORBIDDEN]: '접근 권한이 없습니다.',
  [APIClientErrorCode.NOT_FOUND]: '요청한 리소스를 찾을 수 없습니다.',
  [APIClientErrorCode.VALIDATION_ERROR]: '입력값을 확인해주세요.',
  [APIClientErrorCode.SERVER_ERROR]: '서버 오류가 발생했습니다.',
  [APIClientErrorCode.UNKNOWN_ERROR]: '알 수 없는 오류가 발생했습니다.',
};
```

### 7.2 에러 처리 전략
- **네트워크 에러**: 사용자에게 재시도 옵션 제공
- **인증 에러 (401)**: 토큰 갱신 시도, 실패 시 로그인 페이지로 리다이렉트
- **권한 에러 (403)**: 접근 불가 메시지 표시
- **서버 에러 (500)**: 에러 로그 기록, 사용자에게 안내 메시지
- **타임아웃**: 재시도 로직 적용 (최대 3회)

---

## 8. 테스트 전략

### 8.1 단위 테스트
```typescript
describe('APIClient', () => {
  describe('get', () => {
    it('should make GET request successfully', async () => {
      const mockResponse = { data: { success: true, data: { id: 1 } } };
      jest.spyOn(axios, 'get').mockResolvedValue(mockResponse);
      
      const result = await apiClient.get('/test');
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual({ id: 1 });
    });
    
    it('should handle error response', async () => {
      const mockError = {
        response: {
          data: {
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Invalid input',
            },
          },
        },
      };
      jest.spyOn(axios, 'get').mockRejectedValue(mockError);
      
      const result = await apiClient.get('/test');
      
      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('VALIDATION_ERROR');
    });
  });
});
```

### 8.2 통합 테스트
- 실제 API 서버와의 통신 테스트
- 인터셉터 동작 확인
- 토큰 갱신 플로우 테스트

### 8.3 테스트 커버리지 목표
- **단위 테스트**: 90% 이상
- **통합 테스트**: 핵심 플로우 100%

---

## 9. 성능 최적화

### 9.1 캐싱 전략
- TanStack Query와 연동하여 자동 캐싱
- GET 요청은 기본 5분 캐싱
- 캐시 무효화 전략 적용

### 9.2 최적화 기법
- **요청 취소**: 컴포넌트 언마운트 시 진행 중인 요청 취소
- **요청 중복 제거**: 동일한 요청이 동시에 발생 시 하나만 실행
- **배치 요청**: 여러 요청을 하나로 묶어 처리 (향후 확장)

---

## 10. 보안 고려사항

### 10.1 인증/인가
- JWT 토큰을 Authorization 헤더에 포함
- 토큰은 localStorage에 저장 (향후 httpOnly cookie로 변경 고려)
- 토큰 만료 시 자동 갱신

### 10.2 데이터 보호
- HTTPS 통신 필수
- 민감 정보는 요청 본문에만 포함
- CSRF 토큰 적용 (필요 시)

---

## 11. 배포 및 모니터링

### 11.1 환경 변수
```env
NEXT_PUBLIC_API_BASE_URL=https://api.example.com
NEXT_PUBLIC_API_TIMEOUT=30000
NEXT_PUBLIC_API_RETRY_COUNT=3
```

### 11.2 로깅 및 모니터링
- 모든 API 요청/응답 로깅 (개발 환경)
- 에러 발생 시 Sentry 등으로 전송
- 요청 시간 측정 및 모니터링

---

## 12. 개발 가이드라인

### 12.1 코딩 컨벤션
- TypeScript strict 모드 사용
- 모든 API 호출은 타입 안정성 보장
- 에러는 명확한 메시지와 함께 처리

### 12.2 사용 예시
```typescript
// GET 요청
const { data, isLoading, error } = useApiQuery(
  ['messages', sendId],
  `/api/v1/messages/${sendId}`
);

// POST 요청
const mutation = useApiMutation<SendMessageResponse, SendMessageRequest>(
  '/api/v1/messages/send',
  'POST',
  {
    onSuccess: (data) => {
      console.log('발송 완료:', data);
    },
    onError: (error) => {
      console.error('발송 실패:', error);
    },
  }
);

// 파일 업로드
const uploadFile = async (file: File) => {
  const response = await apiClient.upload(
    '/api/v1/files/upload',
    file,
    (progress) => {
      console.log(`업로드 진행률: ${progress}%`);
    }
  );
  
  if (response.success) {
    console.log('업로드 완료:', response.data);
  }
};
```

---

**문서 버전**: 1.0  
**작성일**: 2024-11-19

