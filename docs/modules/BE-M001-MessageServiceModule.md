# BE-M001: MessageServiceModule 상세 개발 설계서

## 1. 모듈 개요

### 1.1 모듈 식별 정보
- **모듈 ID**: BE-M001
- **모듈명**: MessageServiceModule (문자 발송 서비스 모듈)
- **담당 개발자**: Backend 개발자
- **예상 개발 기간**: 20일
- **우선순위**: P0

### 1.2 모듈 목적 및 범위
- **핵심 기능**: 
  - 일반문자 발송 처리
  - 광고문자 발송 처리 (법적 규정 검증, (광고) 옆 문구 입력, 080 수신거부 번호 입력)
  - 공직선거문자 발송 처리 (선거법 검증, [선거] 옆 문구 입력, 080 수신거부 번호 입력)
  - 발신번호 선택 시 번호만 표시 (용도 제외)
  - 발송 큐 관리
  - 통신사 API 연동
  - 발송 결과 처리
  - 발송 내역 저장
- **비즈니스 가치**: 문자 발송의 핵심 비즈니스 로직 처리 및 법적 규정 준수 보장
- **제외 범위**: 발송 결과 조회 (BE-M005), 템플릿 관리 (BE-M003)

### 1.3 목표 사용자
- **주 사용자 그룹**: Frontend 모듈 (FE-M001)
- **사용자 페르소나**: 시스템 내부 서비스
- **사용 시나리오**: 문자 발송 요청 처리

---

## 2. 기술 아키텍처

### 2.1 모듈 구조
```
MessageServiceModule/
├── controllers/
│   ├── message.controller.ts        # REST API 컨트롤러
│   └── message-schedule.controller.ts # 예약 발송 컨트롤러
├── services/
│   ├── message.service.ts           # 발송 서비스
│   ├── message-validator.service.ts # 검증 서비스
│   ├── message-queue.service.ts     # 큐 관리 서비스
│   └── carrier-api.service.ts       # 통신사 API 서비스
├── entities/
│   ├── message.entity.ts            # 발송 엔티티
│   ├── message-detail.entity.ts     # 발송 상세 엔티티
│   └── message-schedule.entity.ts   # 예약 발송 엔티티
├── dto/
│   ├── send-message.dto.ts          # 발송 요청 DTO
│   └── send-response.dto.ts         # 발송 응답 DTO
├── repositories/
│   ├── message.repository.ts
│   └── message-schedule.repository.ts
├── processors/
│   ├── general-message.processor.ts # 일반문자 처리
│   ├── ad-message.processor.ts      # 광고문자 처리
│   └── election-message.processor.ts # 공직선거문자 처리
├── validators/
│   ├── phone.validator.ts           # 전화번호 검증
│   ├── message-content.validator.ts # 메시지 내용 검증
│   ├── ad-message.validator.ts      # 광고문자 검증
│   └── election-message.validator.ts # 공직선거문자 검증
├── jobs/
│   ├── send-message.job.ts          # 발송 작업
│   └── schedule-message.job.ts      # 예약 발송 작업
├── tests/
│   ├── message.service.spec.ts
│   └── validators.spec.ts
└── index.ts
```

### 2.2 기술 스택
- **프레임워크**: NestJS 10+
- **언어**: TypeScript 5+
- **데이터베이스**: PostgreSQL, Prisma ORM
- **큐 시스템**: BullMQ, Redis
- **스케줄러**: BullMQ Scheduler
- **테스트**: Jest, Supertest

---

## 3. 인터페이스 정의

### 3.1 외부 의존성
```typescript
interface ExternalDependencies {
  modules: [
    'BE-M004: AddressBookServiceModule', // 수신거부 번호 조회
    'BE-M005: SendResultServiceModule',  // 발송 결과 저장
    'BE-M006: PaymentServiceModule',     // 잔액 확인 및 차감
    'BE-M007: UserServiceModule',        // 사용자 정보 조회
    'BE-M008: AuthServiceModule',        // 인증/인가
    'BE-M010: FileServiceModule',        // 이미지 업로드
  ];
  apis: [
    '통신사 SMS/LMS/MMS API',            // 외부 API
  ];
  sharedComponents: [];
  utils: [];
}
```

### 3.2 제공 인터페이스
```typescript
export interface MessageServiceInterface {
  services: {
    MessageService: {
      sendMessage: (request: SendMessageRequest) => Promise<SendMessageResponse>;
      sendTestMessage: (request: TestSendRequest) => Promise<TestSendResponse>;
      validateMessage: (request: SendMessageRequest) => Promise<ValidationResult>;
      calculateCost: (request: CostCalculationRequest) => Promise<number>;
    };
    
    MessageQueueService: {
      enqueueMessage: (message: MessageJob) => Promise<void>;
      processMessage: (job: MessageJob) => Promise<void>;
      retryFailedMessage: (messageId: string) => Promise<void>;
    };
    
    CarrierAPIService: {
      sendSMS: (request: CarrierSMSRequest) => Promise<CarrierResponse>;
      sendLMS: (request: CarrierLMSRequest) => Promise<CarrierResponse>;
      sendMMS: (request: CarrierMMSRequest) => Promise<CarrierResponse>;
      checkStatus: (messageId: string) => Promise<MessageStatus>;
    };
  };
}
```

### 3.3 API 명세
```typescript
// REST API 엔드포인트
interface MessageAPIEndpoints {
  'POST /api/v1/messages/send': {
    method: 'POST';
    path: '/api/v1/messages/send';
    request: SendMessageRequestDTO;
    response: SendMessageResponseDTO;
    errors: [
      'INSUFFICIENT_BALANCE',
      'INVALID_PHONE_NUMBER',
      'INVALID_MESSAGE_TYPE',
      'MESSAGE_TOO_LONG',
      'CALLER_NUMBER_NOT_APPROVED',
      'AD_TIME_RESTRICTION',
      'ELECTION_PERIOD_INVALID',
      'ELECTION_FORBIDDEN_WORD',
      'UNAUTHORIZED',
    ];
  };
  
  'POST /api/v1/messages/test-send': {
    method: 'POST';
    path: '/api/v1/messages/test-send';
    request: TestSendRequestDTO;
    response: TestSendResponseDTO;
  };
  
  'POST /api/v1/messages/calculate-cost': {
    method: 'POST';
    path: '/api/v1/messages/calculate-cost';
    request: CostCalculationRequestDTO;
    response: { cost: number };
  };
}
```

---

## 4. 데이터 모델

### 4.1 엔티티 정의
```typescript
// Prisma Schema
model Message {
  id                String   @id @default(uuid())
  userId            String
  sendType          String   // GENERAL, AD, ELECTION
  callerNumber      String
  messageType       String   // SMS, LMS, MMS
  content           String
  title             String?
  sendMode          String   // IMMEDIATE, SCHEDULED
  scheduledAt       DateTime?
  status            String   // PENDING, PROCESSING, COMPLETED, FAILED
  totalCount        Int
  successCount      Int      @default(0)
  failCount         Int      @default(0)
  cost              Decimal
  templateId        String?
  adPrefixText      String?  // 광고문자: (광고) 옆 문구
  candidateName     String?  // 선거문자: [선거] 옆 문구 (후보자명/정당명)
  rejectNumber      String?  // 광고/선거문자: 080 수신거부 번호
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  user              User     @relation(fields: [userId], references: [id])
  details           MessageDetail[]
  schedule          MessageSchedule?
  
  @@index([userId])
  @@index([status])
  @@index([createdAt])
}

model MessageDetail {
  id                String   @id @default(uuid())
  messageId         String
  recipientNumber   String
  status            String   // PENDING, SENT, DELIVERED, FAILED
  carrierMessageId  String?
  errorCode         String?
  errorMessage      String?
  sentAt            DateTime?
  deliveredAt       DateTime?
  createdAt         DateTime @default(now())
  
  message           Message  @relation(fields: [messageId], references: [id], onDelete: Cascade)
  
  @@index([messageId])
  @@index([recipientNumber])
  @@index([status])
}

model MessageSchedule {
  id                String   @id @default(uuid())
  messageId         String   @unique
  scheduledAt       DateTime
  status            String   // PENDING, PROCESSING, COMPLETED, CANCELLED
  createdAt         DateTime @default(now())
  
  message           Message  @relation(fields: [messageId], references: [id], onDelete: Cascade)
  
  @@index([scheduledAt])
  @@index([status])
}
```

### 4.2 DTO 정의
```typescript
export class SendMessageRequestDTO {
  @IsEnum(['GENERAL', 'AD', 'ELECTION'])
  sendType: string;
  
  @IsString()
  @IsNotEmpty()
  callerNumber: string;
  
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(10000)
  @IsString({ each: true })
  recipientNumbers: string[];
  
  @IsEnum(['SMS', 'LMS', 'MMS'])
  messageType: string;
  
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  content: string;
  
  @IsOptional()
  @IsString()
  @MaxLength(40)
  title?: string;
  
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];
  
  @IsEnum(['IMMEDIATE', 'SCHEDULED'])
  sendMode: string;
  
  @IsOptional()
  @IsDateString()
  scheduledAt?: string;
  
  @IsOptional()
  @IsString()
  templateId?: string;
  
  @IsOptional()
  @IsString()
  adPrefixText?: string;  // 광고문자: (광고) 옆 문구
  
  @IsOptional()
  @IsString()
  candidateName?: string;  // 선거문자: [선거] 옆 문구 (후보자명/정당명)
  
  @IsOptional()
  @IsString()
  rejectNumber?: string;  // 광고/선거문자: 080 수신거부 번호 (080- 뒤 8자리)
}

export class SendMessageResponseDTO {
  sendId: string;
  totalCount: number;
  successCount: number;
  failCount: number;
  estimatedCost: number;
  scheduledAt?: string;
}
```

---

## 5. 핵심 컴포넌트/서비스 명세

### 5.1 주요 서비스

#### MessageService
```typescript
@Injectable()
export class MessageService {
  constructor(
    private readonly messageRepository: MessageRepository,
    private readonly messageQueueService: MessageQueueService,
    private readonly validatorService: MessageValidatorService,
    private readonly paymentService: PaymentService,
    private readonly addressBookService: AddressBookService,
    private readonly carrierAPIService: CarrierAPIService,
  ) {}
  
  async sendMessage(request: SendMessageRequestDTO, userId: string): Promise<SendMessageResponseDTO> {
    // 1. 발신번호 검증
    await this.validateCallerNumber(request.callerNumber, userId, request.sendType);
    
    // 2. 수신번호 검증 및 필터링
    const validRecipients = await this.validateAndFilterRecipients(
      request.recipientNumbers,
      userId
    );
    
    if (validRecipients.length === 0) {
      throw new BadRequestException('유효한 수신번호가 없습니다.');
    }
    
    // 3. 메시지 내용 검증
    await this.validatorService.validateMessageContent(request);
    
    // 4. 발송 타입별 추가 검증
    if (request.sendType === 'AD') {
      await this.validatorService.validateAdMessage(request);
    } else if (request.sendType === 'ELECTION') {
      await this.validatorService.validateElectionMessage(request);
    }
    
    // 5. 비용 계산
    const cost = await this.calculateCost({
      messageType: request.messageType,
      recipientCount: validRecipients.length,
    });
    
    // 6. 잔액 확인
    const balance = await this.paymentService.getBalance(userId);
    if (balance < cost) {
      throw new BadRequestException('잔액이 부족합니다.');
    }
    
    // 7. 발송 내역 생성
    const message = await this.messageRepository.create({
      userId,
      sendType: request.sendType,
      callerNumber: request.callerNumber,
      messageType: request.messageType,
      content: request.content,
      title: request.title,
      sendMode: request.sendMode,
      scheduledAt: request.scheduledAt ? new Date(request.scheduledAt) : null,
      totalCount: validRecipients.length,
      cost,
      templateId: request.templateId,
      adPrefixText: request.adPrefixText,
      candidateName: request.candidateName,
      rejectNumber: request.rejectNumber,
      status: request.sendMode === 'SCHEDULED' ? 'PENDING' : 'PROCESSING',
    });
    
    // 8. 발송 상세 내역 생성
    await this.messageRepository.createDetails(
      message.id,
      validRecipients.map(recipient => ({
        recipientNumber: recipient,
        status: 'PENDING',
      }))
    );
    
    // 9. 즉시 발송 또는 예약 발송
    if (request.sendMode === 'IMMEDIATE') {
      // 큐에 추가
      await this.messageQueueService.enqueueMessage({
        messageId: message.id,
        priority: 1,
      });
      
      // 잔액 차감
      await this.paymentService.deductBalance(userId, cost, {
        type: 'MESSAGE_SEND',
        referenceId: message.id,
      });
    } else {
      // 예약 발송 스케줄 등록
      await this.messageRepository.createSchedule({
        messageId: message.id,
        scheduledAt: new Date(request.scheduledAt!),
        status: 'PENDING',
      });
    }
    
    return {
      sendId: message.id,
      totalCount: validRecipients.length,
      successCount: 0,
      failCount: 0,
      estimatedCost: cost,
      scheduledAt: request.scheduledAt,
    };
  }
  
  private async validateCallerNumber(
    callerNumber: string,
    userId: string,
    sendType: string
  ): Promise<void> {
    const callerNumberEntity = await this.userService.getCallerNumber(
      userId,
      callerNumber
    );
    
    if (!callerNumberEntity) {
      throw new NotFoundException('발신번호를 찾을 수 없습니다.');
    }
    
    if (callerNumberEntity.status !== 'APPROVED') {
      throw new BadRequestException('승인되지 않은 발신번호입니다.');
    }
    
    // 광고문자/선거문자는 발신번호 선택 시 080번호 연동 여부 체크 제거
    // 대신 발송 시 요청에 포함된 080 수신거부 번호로 처리
  }
  
  private async validateAndFilterRecipients(
    recipientNumbers: string[],
    userId: string
  ): Promise<string[]> {
    // 1. 전화번호 형식 검증
    const validNumbers = recipientNumbers.filter(num => 
      this.validatorService.isValidPhoneNumber(num)
    );
    
    // 2. 중복 제거
    const uniqueNumbers = [...new Set(validNumbers)];
    
    // 3. 수신거부 번호 제외
    const blockedNumbers = await this.addressBookService.getBlockedNumbers(userId);
    const filteredNumbers = uniqueNumbers.filter(
      num => !blockedNumbers.includes(num)
    );
    
    return filteredNumbers;
  }
  
  async calculateCost(request: CostCalculationRequest): Promise<number> {
    const unitPrice = this.getUnitPrice(request.messageType);
    return unitPrice * request.recipientCount;
  }
  
  private getUnitPrice(messageType: string): number {
    const prices = {
      SMS: 20,
      LMS: 50,
      MMS: 200,
    };
    return prices[messageType] || 0;
  }
}
```

#### MessageQueueService
```typescript
@Injectable()
export class MessageQueueService {
  private readonly messageQueue: Queue;
  
  constructor(
    @InjectQueue('message') private readonly queue: Queue,
    private readonly messageService: MessageService,
    private readonly carrierAPIService: CarrierAPIService,
  ) {
    this.messageQueue = queue;
    this.setupProcessor();
  }
  
  async enqueueMessage(job: MessageJob): Promise<void> {
    await this.messageQueue.add('send-message', job, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    });
  }
  
  private setupProcessor(): void {
    this.messageQueue.process('send-message', async (job) => {
      const { messageId } = job.data;
      
      // 발송 내역 조회
      const message = await this.messageService.getMessage(messageId);
      const details = await this.messageService.getMessageDetails(messageId);
      
      // 상태 업데이트
      await this.messageService.updateStatus(messageId, 'PROCESSING');
      
      // 통신사 API 호출
      const results = await Promise.allSettled(
        details.map(detail => 
          this.carrierAPIService.sendMessage({
            callerNumber: message.callerNumber,
            recipientNumber: detail.recipientNumber,
            messageType: message.messageType,
            content: message.content,
            title: message.title,
          })
        )
      );
      
      // 결과 처리
      let successCount = 0;
      let failCount = 0;
      
      results.forEach((result, index) => {
        const detail = details[index];
        
        if (result.status === 'fulfilled') {
          successCount++;
          this.messageService.updateDetailStatus(detail.id, {
            status: 'SENT',
            carrierMessageId: result.value.messageId,
            sentAt: new Date(),
          });
        } else {
          failCount++;
          this.messageService.updateDetailStatus(detail.id, {
            status: 'FAILED',
            errorCode: result.reason.code,
            errorMessage: result.reason.message,
          });
        }
      });
      
      // 발송 내역 업데이트
      await this.messageService.updateMessage(messageId, {
        status: 'COMPLETED',
        successCount,
        failCount,
      });
    });
  }
}
```

---

## 6. 이벤트 및 메시징

### 6.1 발행 이벤트
```typescript
enum MessageServiceEvents {
  MESSAGE_CREATED = 'message.created',
  MESSAGE_SENT = 'message.sent',
  MESSAGE_FAILED = 'message.failed',
  MESSAGE_COMPLETED = 'message.completed',
  SCHEDULE_CREATED = 'message.schedule.created',
  SCHEDULE_CANCELLED = 'message.schedule.cancelled',
}

@EventPattern(MessageServiceEvents.MESSAGE_SENT)
export class MessageSentEvent {
  messageId: string;
  userId: string;
  successCount: number;
  failCount: number;
  timestamp: Date;
}
```

### 6.2 구독 이벤트
```typescript
@EventPattern('payment.balance.deducted')
async handleBalanceDeducted(data: BalanceDeductedEvent) {
  // 발송 내역과 결제 내역 연결
}

@EventPattern('addressbook.blocked.updated')
async handleBlockedUpdated(data: BlockedUpdatedEvent) {
  // 수신거부 목록 캐시 갱신
}
```

---

## 7. 에러 처리

### 7.1 에러 코드 정의
```typescript
enum MessageServiceErrorCode {
  CALLER_NUMBER_NOT_FOUND = 'MSG_SVC_001',
  CALLER_NUMBER_NOT_APPROVED = 'MSG_SVC_002',
  INVALID_RECIPIENT_NUMBER = 'MSG_SVC_003',
  MESSAGE_TOO_LONG = 'MSG_SVC_004',
  INSUFFICIENT_BALANCE = 'MSG_SVC_005',
  AD_TIME_RESTRICTION = 'MSG_SVC_006',
  ELECTION_PERIOD_INVALID = 'MSG_SVC_007',
  ELECTION_FORBIDDEN_WORD = 'MSG_SVC_008',
  CARRIER_API_ERROR = 'MSG_SVC_009',
}
```

### 7.2 에러 처리 전략
- **비즈니스 로직 에러**: BadRequestException으로 처리
- **통신사 API 에러**: 재시도 로직 적용 (최대 3회)
- **시스템 에러**: 에러 로그 기록, 알림 발송

---

## 8. 테스트 전략

### 8.1 단위 테스트
```typescript
describe('MessageService', () => {
  describe('sendMessage', () => {
    it('should send message successfully', async () => {
      // ...
    });
    
    it('should throw error when balance insufficient', async () => {
      // ...
    });
  });
});
```

### 8.2 통합 테스트
- 전체 발송 플로우 테스트
- 통신사 API 모킹 테스트
- 큐 처리 테스트

### 8.3 테스트 커버리지 목표
- **단위 테스트**: 85% 이상
- **통합 테스트**: 핵심 플로우 100%

---

## 9. 성능 최적화

### 9.1 최적화 기법
- **배치 처리**: 대량 발송 시 배치 단위로 처리
- **비동기 처리**: 큐를 통한 비동기 발송
- **캐싱**: 수신거부 목록 캐싱
- **인덱스**: 데이터베이스 인덱스 최적화

---

## 10. 보안 고려사항

### 10.1 인증/인가
- JWT 토큰 검증
- 사용자별 발신번호 접근 권한 확인
- 발송 내역은 본인만 조회 가능

### 10.2 데이터 보호
- 개인정보 암호화 저장
- SQL Injection 방지 (Prisma ORM 사용)
- XSS 방지 (입력값 검증)

---

**문서 버전**: 1.1  
**작성일**: 2024-11-19  
**최종 수정일**: 2024-11-19

