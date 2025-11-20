# FE-M006: PaymentModule 상세 개발 설계서

## 1. 모듈 개요

### 1.1 모듈 식별 정보
- **모듈 ID**: FE-M006
- **모듈명**: PaymentModule (결제 관리 모듈)
- **담당 개발자**: Frontend 개발자
- **예상 개발 기간**: 12일
- **우선순위**: P0

### 1.2 모듈 목적 및 범위
- **핵심 기능**: 
  - 포인트 충전
  - 충전/사용 내역 조회
  - 세금계산서 발행
  - 요금 안내
  - 견적 문의
- **비즈니스 가치**: 발송 비용 결제 및 관리

### 1.3 목표 사용자
- **주 사용자 그룹**: 개인/기업 회원

---

## 2. 기술 아키텍처

### 2.1 모듈 구조
```
PaymentModule/
├── components/
│   ├── ChargePage.tsx
│   ├── PaymentHistoryPage.tsx
│   ├── TaxInvoicePage.tsx
│   └── PaymentMethodSelect.tsx
├── hooks/
│   ├── usePayment.ts
│   └── usePaymentHistory.ts
└── services/
    └── paymentService.ts
```

### 2.2 기술 스택
- **프레임워크**: Next.js 14+, React 18+
- **상태관리**: TanStack Query
- **PG 연동**: PG사 결제 모듈

---

## 3. 인터페이스 정의

### 3.1 외부 의존성
```typescript
interface ExternalDependencies {
  modules: ['FE-M008: AuthModule', 'FE-M009: CommonUIModule'];
  apis: ['BE-M006: PaymentServiceModule'];
  sharedComponents: ['Button', 'Input', 'Modal'];
  utils: ['COM-M001: APIClientModule'];
}
```

---

## 4. 데이터 모델

### 4.1 엔티티 정의
```typescript
interface Payment {
  id: string;
  userId: string;
  amount: number;
  method: string;
  status: string;
  createdAt: Date;
}

interface PaymentHistory {
  id: string;
  type: 'CHARGE' | 'USE' | 'REFUND';
  amount: number;
  balance: number;
  description: string;
  createdAt: Date;
}
```

---

## 5. 핵심 컴포넌트/서비스 명세

### 5.1 주요 컴포넌트

#### ChargePage
```typescript
const ChargePage: React.FC = () => {
  const { charge, isLoading } = usePayment();
  const [amount, setAmount] = useState(50000);
  const [method, setMethod] = useState('CARD');
  
  const handleCharge = async () => {
    const result = await charge({ amount, method });
    if (result.success) {
      // PG 결제 모듈 호출
      // ...
    }
  };
  
  return (
    <div>
      <AmountSelect value={amount} onChange={setAmount} />
      <PaymentMethodSelect value={method} onChange={setMethod} />
      <Button onClick={handleCharge}>충전하기</Button>
    </div>
  );
};
```

---

## 6. 에러 처리

### 6.1 에러 코드 정의
```typescript
enum PaymentErrorCode {
  INSUFFICIENT_AMOUNT = 'PAY_001',
  PAYMENT_FAILED = 'PAY_002',
  PG_ERROR = 'PAY_003',
}
```

---

**문서 버전**: 1.0  
**작성일**: 2024-11-19

