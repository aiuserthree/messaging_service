# COM-M003: UtilsModule 상세 개발 설계서

## 1. 모듈 개요

### 1.1 모듈 식별 정보
- **모듈 ID**: COM-M003
- **모듈명**: UtilsModule (유틸리티 모듈)
- **담당 개발자**: Frontend/Backend 개발자
- **예상 개발 기간**: 5일
- **우선순위**: P0

### 1.2 모듈 목적 및 범위
- **핵심 기능**: 
  - 공통 유틸리티 함수
  - 날짜 포맷팅
  - 숫자 포맷팅
  - 문자열 처리
- **비즈니스 가치**: 공통 로직 재사용

---

## 2. 기술 아키텍처

### 2.1 모듈 구조
```
UtilsModule/
├── date.ts
├── number.ts
├── string.ts
├── phone.ts
└── index.ts
```

---

## 3. 인터페이스 정의

### 3.1 제공 인터페이스
```typescript
export interface UtilsInterface {
  date: {
    format: (date: Date, format: string) => string;
    parse: (dateString: string) => Date;
  };
  number: {
    formatCurrency: (amount: number) => string;
    formatPhone: (phone: string) => string;
  };
  string: {
    truncate: (str: string, length: number) => string;
    maskPhone: (phone: string) => string;
  };
}
```

---

## 4. 핵심 함수

### 4.1 유틸리티 함수
```typescript
// date.ts
export function formatDate(date: Date, format: string): string {
  // date-fns 또는 dayjs 사용
}

// phone.ts
export function formatPhoneNumber(phone: string): string {
  return phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
}

export function maskPhoneNumber(phone: string): string {
  return phone.replace(/(\d{3})-(\d{4})-(\d{4})/, '$1-****-$3');
}

// number.ts
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
  }).format(amount);
}
```

---

**문서 버전**: 1.0  
**작성일**: 2024-11-19

