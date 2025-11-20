# BE-M006: PaymentServiceModule 상세 개발 설계서

## 1. 모듈 개요

### 1.1 모듈 식별 정보
- **모듈 ID**: BE-M006
- **모듈명**: PaymentServiceModule (결제 서비스 모듈)
- **담당 개발자**: Backend 개발자
- **예상 개발 기간**: 15일
- **우선순위**: P0

### 1.2 모듈 목적 및 범위
- **핵심 기능**: 
  - 포인트 충전 처리
  - 잔액 관리
  - 결제 내역 관리
  - 세금계산서 발행
  - PG사 연동
- **비즈니스 가치**: 발송 비용 결제 및 관리

---

## 2. 기술 아키텍처

### 2.1 모듈 구조
```
PaymentServiceModule/
├── controllers/
│   └── payment.controller.ts
├── services/
│   ├── payment.service.ts
│   ├── pg.service.ts
│   └── tax-invoice.service.ts
└── entities/
    └── payment.entity.ts
```

### 2.2 기술 스택
- **프레임워크**: NestJS 10+
- **PG 연동**: PG사 SDK
- **데이터베이스**: PostgreSQL, Prisma ORM

---

## 3. 인터페이스 정의

### 3.1 외부 의존성
```typescript
interface ExternalDependencies {
  modules: [
    'BE-M007: UserServiceModule',
    'BE-M008: AuthServiceModule',
  ];
  apis: ['PG사 API'];
  sharedComponents: [];
  utils: [];
}
```

---

## 4. 데이터 모델

### 4.1 엔티티 정의
```typescript
model Payment {
  id            String   @id @default(uuid())
  userId        String
  amount        Decimal
  method        String
  status        String
  pgTransactionId String?
  createdAt     DateTime @default(now())
  
  user          User     @relation(fields: [userId], references: [id])
}
```

---

## 5. 핵심 컴포넌트/서비스 명세

### 5.1 주요 서비스

#### PaymentService
```typescript
@Injectable()
export class PaymentService {
  async charge(userId: string, amount: number, method: string) {
    // PG 결제 처리
    const pgResult = await this.pgService.processPayment({
      userId,
      amount,
      method,
    });
    
    if (pgResult.success) {
      // 잔액 충전
      await this.userService.addBalance(userId, amount);
      
      // 결제 내역 저장
      await this.paymentRepository.create({
        userId,
        amount,
        method,
        status: 'COMPLETED',
        pgTransactionId: pgResult.transactionId,
      });
    }
    
    return pgResult;
  }
  
  async getBalance(userId: string): Promise<number> {
    const user = await this.userService.findById(userId);
    return user.balance;
  }
  
  async deductBalance(userId: string, amount: number, metadata: any) {
    const user = await this.userService.findById(userId);
    
    if (user.balance < amount) {
      throw new BadRequestException('잔액이 부족합니다.');
    }
    
    await this.userService.updateBalance(userId, user.balance - amount);
    
    // 사용 내역 저장
    await this.paymentHistoryRepository.create({
      userId,
      type: 'USE',
      amount: -amount,
      balance: user.balance - amount,
      description: metadata.description,
      referenceId: metadata.referenceId,
    });
  }
}
```

---

## 6. 에러 처리

### 6.1 에러 코드 정의
```typescript
enum PaymentErrorCode {
  INSUFFICIENT_BALANCE = 'PAY_SVC_001',
  PAYMENT_FAILED = 'PAY_SVC_002',
  PG_ERROR = 'PAY_SVC_003',
}
```

---

**문서 버전**: 1.0  
**작성일**: 2024-11-19

