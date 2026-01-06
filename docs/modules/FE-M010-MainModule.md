# FE-M010: MainModule 상세 개발 설계서

## 1. 모듈 개요

### 1.1 모듈 식별 정보
- **모듈 ID**: FE-M010
- **모듈명**: MainModule (메인/대시보드 모듈)
- **담당 개발자**: Frontend 개발자
- **예상 개발 기간**: 8일
- **우선순위**: P0

### 1.2 모듈 목적 및 범위
- **핵심 기능**: 
  - 랜딩 페이지 (비로그인 사용자용)
  - 대시보드 (로그인 사용자용)
  - 가격 안내
  - 서비스 소개
  - 발송 통계 요약
  - 잔액/마일리지 표시
- **비즈니스 가치**: 서비스 첫인상 및 사용자 현황 한눈에 파악
- **제외 범위**: 실제 발송 기능 (FE-M001, FE-M002)

### 1.3 목표 사용자
- **주 사용자 그룹**: 모든 방문자, 로그인 회원
- **사용자 페르소나**: 서비스 검토 중인 잠재 고객, 기존 회원
- **사용 시나리오**: 서비스 소개 확인, 발송 현황 모니터링

---

## 2. 기술 아키텍처

### 2.1 모듈 구조
```
MainModule/
├── components/
│   ├── LandingPage.tsx              # 랜딩 페이지 (index.html)
│   ├── DashboardPage.tsx            # 대시보드 (main.html)
│   ├── HeroSection.tsx              # 히어로 섹션
│   ├── PricingSection.tsx           # 가격 카드 섹션
│   ├── ServiceCatalog.tsx           # 서비스 카탈로그
│   ├── FAQSection.tsx               # FAQ 아코디언
│   ├── BannerCarousel.tsx           # 배너 캐러셀
│   ├── NoticeCard.tsx               # 공지사항 카드
│   ├── SendStatisticsCard.tsx       # 발송 성공률 카드
│   ├── GaugeChart.tsx               # 게이지 차트
│   ├── UsageStatisticsCard.tsx      # 사용 통계 카드
│   ├── BalanceCard.tsx              # 잔액 카드
│   └── MessageTypeChart.tsx         # 메시지 타입별 통계
├── hooks/
│   ├── useDashboard.ts              # 대시보드 데이터 훅
│   ├── useStatistics.ts             # 통계 데이터 훅
│   └── usePricing.ts                # 가격 정보 훅
├── services/
│   ├── dashboardService.ts          # 대시보드 API
│   └── statisticsService.ts         # 통계 API
├── types/
│   └── dashboard.types.ts           # 대시보드 타입
└── index.ts
```

### 2.2 기술 스택
- **프레임워크**: Next.js 14+ (App Router)
- **UI 라이브러리**: React 18+
- **상태관리**: TanStack Query
- **스타일링**: Tailwind CSS, Shadcn/ui
- **차트**: SVG 기반 커스텀 차트

---

## 3. 인터페이스 정의

### 3.1 외부 의존성
```typescript
interface ExternalDependencies {
  modules: [
    'FE-M008: AuthModule',           // 로그인 상태 확인
    'FE-M009: CommonUIModule',       // 공통 UI
  ];
  apis: [
    'BE-M005: SendResultServiceModule', // 발송 통계
    'BE-M006: PaymentServiceModule',    // 잔액 조회
    'BE-M007: UserServiceModule',       // 사용자 정보
  ];
  sharedComponents: [
    'Button', 'Card', 'Badge', 'Tabs'
  ];
}
```

### 3.2 API 명세
```typescript
// 대시보드 통계 API
interface DashboardAPI {
  'GET /api/v1/dashboard/statistics': {
    response: {
      sendSuccessRate: number;
      totalSent: number;
      successCount: number;
      failCount: number;
      pendingCount: number;
      processingCount: number;
    };
  };
  
  'GET /api/v1/dashboard/usage': {
    response: {
      cumulativeSent: number;
      smsAvailable: number;
      sendCycle: string;
      customerCount: number;
      recentMessageStats: {
        type: string;
        count: number;
        percentage: number;
      }[];
    };
  };
  
  'GET /api/v1/dashboard/balance': {
    response: {
      point: number;
      mileage: number;
      callerBalances: {
        number: string;
        balance: number;
      }[];
    };
  };
}
```

---

## 4. 데이터 모델

### 4.1 엔티티 정의
```typescript
interface DashboardStatistics {
  sendSuccessRate: number;
  totalSent: number;
  successCount: number;
  failCount: number;
  pendingCount: number;
  processingCount: number;
}

interface UsageStatistics {
  cumulativeSent: number;
  smsAvailable: number;
  sendCycle: string;
  customerCount: number;
}

interface MessageTypeStats {
  type: 'SMS' | 'LMS' | 'MMS' | 'ALIMTALK' | 'BRANDTALK';
  count: number;
  percentage: number;
}

interface PricingCard {
  type: string;
  price: number;
  unit: string;
  maxBytes: number;
  features: string[];
  discount?: string;
}
```

---

## 5. 핵심 컴포넌트/서비스 명세

### 5.1 주요 컴포넌트

#### LandingPage (index.html)
```typescript
const LandingPage: React.FC = () => {
  return (
    <>
      <HeroSection />
      <PricingSection />
      <BannerCarousel />
      <NoticeCard />
      <ServiceCatalog />
      <FAQSection />
    </>
  );
};
```

#### DashboardPage (main.html)
```typescript
const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { statistics, isLoading } = useDashboard();
  
  return (
    <div className="dashboard-container">
      <WelcomeHeader userName={user.name} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SendStatisticsCard statistics={statistics} />
        <UsageStatisticsCard />
        <ConsultationCard />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BalanceCard />
        <MessageTypeChart />
      </div>
    </div>
  );
};
```

#### GaugeChart
```typescript
interface GaugeChartProps {
  percentage: number;
  size?: number;
}

const GaugeChart: React.FC<GaugeChartProps> = ({ percentage, size = 200 }) => {
  const totalLength = 276; // 반원 호의 길이
  const fillLength = (percentage / 100) * totalLength;
  
  return (
    <svg viewBox="0 0 200 120" width={size}>
      {/* 배경 호 */}
      <path
        d="M 20 100 A 80 80 0 0 1 180 100"
        fill="none"
        stroke="#e2e8f0"
        strokeWidth="12"
      />
      {/* 진행률 호 */}
      <path
        d="M 20 100 A 80 80 0 0 1 180 100"
        fill="none"
        stroke="#10b981"
        strokeWidth="12"
        strokeDasharray={`${fillLength} ${totalLength}`}
        className="transition-all duration-1000"
      />
      {/* 퍼센트 텍스트 */}
      <text x="100" y="90" textAnchor="middle" className="text-3xl font-bold">
        {percentage}%
      </text>
    </svg>
  );
};
```

### 5.2 Custom Hooks

#### useDashboard
```typescript
export function useDashboard() {
  const statisticsQuery = useQuery({
    queryKey: ['dashboard', 'statistics'],
    queryFn: () => dashboardService.getStatistics(),
    staleTime: 1000 * 60 * 5, // 5분 캐싱
  });
  
  const usageQuery = useQuery({
    queryKey: ['dashboard', 'usage'],
    queryFn: () => dashboardService.getUsage(),
    staleTime: 1000 * 60 * 5,
  });
  
  const balanceQuery = useQuery({
    queryKey: ['dashboard', 'balance'],
    queryFn: () => dashboardService.getBalance(),
    staleTime: 1000 * 60, // 1분 캐싱
  });
  
  return {
    statistics: statisticsQuery.data,
    usage: usageQuery.data,
    balance: balanceQuery.data,
    isLoading: statisticsQuery.isLoading || usageQuery.isLoading,
  };
}
```

---

## 6. 이벤트 및 메시징

### 6.1 발행 이벤트
```typescript
enum MainEvents {
  DASHBOARD_LOADED = 'main.dashboard.loaded',
  STATISTICS_REFRESHED = 'main.statistics.refreshed',
}
```

---

## 7. 에러 처리

### 7.1 에러 처리 전략
- **데이터 로딩 실패**: 스켈레톤 UI 표시, 재시도 버튼 제공
- **부분 실패**: 성공한 데이터만 표시, 실패 영역 안내 메시지

---

## 8. 테스트 전략

### 8.1 단위 테스트
- GaugeChart 렌더링 테스트
- 통계 데이터 계산 테스트

### 8.2 테스트 커버리지 목표
- **단위 테스트**: 80% 이상

---

## 9. 성능 최적화

### 9.1 최적화 기법
- **데이터 캐싱**: 대시보드 데이터 5분 캐싱
- **이미지 최적화**: Next.js Image 컴포넌트 사용
- **코드 스플리팅**: 차트 컴포넌트 동적 import

---

## 10. 보안 고려사항

### 10.1 데이터 보호
- 잔액 정보 인증된 사용자만 조회
- 통계 데이터 본인 것만 표시

---

**문서 버전**: 1.0  
**작성일**: 2026-01-05
