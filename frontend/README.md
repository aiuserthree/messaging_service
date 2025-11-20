# 메시징 서비스 플랫폼 - Frontend

메시징 서비스 플랫폼의 Frontend 애플리케이션입니다.

## 기술 스택

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript 5+
- **UI Library**: React 18+
- **Styling**: Tailwind CSS
- **State Management**: Zustand, TanStack Query
- **Form Management**: React Hook Form, Zod
- **HTTP Client**: Axios

## 시작하기

### 설치

```bash
npm install
```

### 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

### 빌드

```bash
npm run build
npm start
```

## 프로젝트 구조

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router 페이지
│   │   ├── login/             # 로그인 페이지
│   │   ├── dashboard/         # 대시보드
│   │   └── kakao/             # 카카오톡 발송
│   ├── modules/               # 기능 모듈
│   │   ├── common/            # 공통 모듈
│   │   │   ├── api-client/   # API 클라이언트
│   │   │   ├── ui/           # 공통 UI 컴포넌트
│   │   │   ├── validation/   # 검증 모듈
│   │   │   └── utils/        # 유틸리티
│   │   ├── auth/             # 인증 모듈
│   │   └── kakao-send/       # 카카오톡 발송 모듈
│   ├── components/            # 공통 컴포넌트
│   └── utils/                 # 유틸리티 함수
├── public/                    # 정적 파일
└── docs/                      # 문서
```

## 주요 기능

### 구현 완료
- ✅ 프로젝트 초기 설정
- ✅ 공통 모듈 (API Client, UI Components, Validation, Utils)
- ✅ 인증 모듈 (로그인, 회원가입)
- ✅ 대시보드
- ✅ 알림톡 발송 (템플릿 확인 포함)
- ✅ 브랜드톡 발송

### 구현 예정
- ⏳ 문자 발송 (일반/광고/공직선거)
- ⏳ 주소록 관리
- ⏳ 발송 결과 조회
- ⏳ 결제 관리
- ⏳ 마이페이지

## 환경 변수

`.env.local` 파일을 생성하고 다음 변수를 설정하세요:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api/v1
```

## 개발 가이드

### 모듈 구조

각 기능은 독립적인 모듈로 구성되어 있습니다:

- `modules/common`: 모든 모듈에서 공통으로 사용하는 기능
- `modules/auth`: 인증/인가 관련 기능
- `modules/kakao-send`: 카카오톡 발송 기능

### 컴포넌트 작성 규칙

1. 컴포넌트는 `modules/[module-name]/components/` 디렉토리에 위치
2. TypeScript로 작성
3. Props 인터페이스 명시
4. 공통 UI 컴포넌트는 `modules/common/ui` 사용

### API 호출

```typescript
import { useApiQuery, useApiMutation } from "@/modules/common/api-client/hooks/useApi";

// GET 요청
const { data, isLoading } = useApiQuery(
  ["key"],
  "/api/endpoint"
);

// POST 요청
const mutation = useApiMutation("/api/endpoint", "POST");
mutation.mutate({ data });
```

## 라이선스

프로젝트 내부 사용

