# BE-M002: KakaoServiceModule 상세 개발 설계서

## 1. 모듈 개요

### 1.1 모듈 식별 정보
- **모듈 ID**: BE-M002
- **모듈명**: KakaoServiceModule (카카오톡 발송 서비스 모듈)
- **담당 개발자**: Backend 개발자
- **예상 개발 기간**: 20일
- **우선순위**: P0

### 1.2 모듈 목적 및 범위
- **핵심 기능**: 
  - 알림톡 발송 처리
  - 브랜드톡 발송 처리
  - 템플릿 존재 여부 확인
  - 카카오 API 연동
  - 변수 치환 처리
  - 대체 메시지 처리
  - 엑셀 업로드 데이터 처리
- **비즈니스 가치**: 카카오톡 메시지 발송 기능 제공, 템플릿 검증 및 발송 처리
- **제외 범위**: 템플릿 관리 (BE-M003), 발송 결과 조회 (BE-M005)

### 1.3 목표 사용자
- **주 사용자 그룹**: Frontend 모듈 (FE-M002)
- **사용자 페르소나**: 시스템 내부 서비스
- **사용 시나리오**: 카카오톡 메시지 발송 요청 처리

---

## 2. 기술 아키텍처

### 2.1 모듈 구조
```
KakaoServiceModule/
├── controllers/
│   ├── kakao.controller.ts
│   └── template-check.controller.ts
├── services/
│   ├── kakao.service.ts
│   ├── alimtalk.service.ts
│   ├── brandtalk.service.ts
│   ├── template-check.service.ts
│   └── variable-replacer.service.ts
├── clients/
│   └── kakao-api.client.ts
├── entities/
│   ├── kakao-message.entity.ts
│   └── kakao-template.entity.ts
├── dto/
│   ├── send-alimtalk.dto.ts
│   ├── send-brandtalk.dto.ts
│   └── template-check.dto.ts
├── repositories/
│   └── kakao-template.repository.ts
├── processors/
│   ├── alimtalk.processor.ts
│   └── brandtalk.processor.ts
├── validators/
│   ├── template.validator.ts
│   ├── variable.validator.ts
│   └── recipient.validator.ts
├── jobs/
│   └── send-kakao-message.job.ts
├── tests/
│   ├── kakao.service.spec.ts
│   └── validators.spec.ts
└── index.ts
```

### 2.2 기술 스택
- **프레임워크**: NestJS 10+
- **언어**: TypeScript 5+
- **데이터베이스**: PostgreSQL, Prisma ORM
- **큐 시스템**: BullMQ, Redis
- **카카오 API**: 카카오 비즈니스 API
- **테스트**: Jest, Supertest

---

## 3. 인터페이스 정의

### 3.1 외부 의존성
```typescript
interface ExternalDependencies {
  modules: [
    'BE-M003: TemplateServiceModule',      // 템플릿 조회
    'BE-M004: AddressBookServiceModule',   // 수신거부 번호 조회
    'BE-M005: SendResultServiceModule',    // 발송 결과 저장
    'BE-M006: PaymentServiceModule',       // 잔액 확인 및 차감
    'BE-M007: UserServiceModule',          // 사용자 정보 조회
    'BE-M008: AuthServiceModule',          // 인증/인가
    'BE-M010: FileServiceModule',          // 이미지 업로드
  ];
  apis: [
    '카카오 비즈니스 API',                  // 외부 API
  ];
  sharedComponents: [];
  utils: [];
}
```

### 3.2 제공 인터페이스
```typescript
export interface KakaoServiceInterface {
  services: {
    TemplateCheckService: {
      checkTemplate: (channelId: string, sendType: string) => Promise<TemplateCheckResult>;
    };
    
    AlimtalkService: {
      sendAlimtalk: (request: SendAlimtalkRequest) => Promise<SendAlimtalkResponse>;
      validateAlimtalk: (request: SendAlimtalkRequest) => Promise<ValidationResult>;
    };
    
    BrandtalkService: {
      sendBrandtalk: (request: SendBrandtalkRequest) => Promise<SendBrandtalkResponse>;
      validateBrandtalk: (request: SendBrandtalkRequest) => Promise<ValidationResult>;
    };
    
    VariableReplacerService: {
      replaceVariables: (content: string, variables: Record<string, string>) => string;
      validateVariables: (template: Template, variables: Record<string, string>) => ValidationResult;
    };
  };
}
```

### 3.3 API 명세
```typescript
// REST API 엔드포인트
interface KakaoAPIEndpoints {
  'GET /api/v1/kakao/templates/check': {
    method: 'GET';
    path: '/api/v1/kakao/templates/check';
    request: {
      channelId: string;
      sendType: 'ALIMTALK' | 'BRANDTALK';
    };
    response: {
      hasTemplate: boolean;
      templateCount: number;
      message?: string;
    };
    errors: ['CHANNEL_NOT_FOUND', 'UNAUTHORIZED'];
  };
  
  'POST /api/v1/kakao/alimtalk/send': {
    method: 'POST';
    path: '/api/v1/kakao/alimtalk/send';
    request: SendAlimtalkRequestDTO;
    response: SendAlimtalkResponseDTO;
    errors: [
      'NO_TEMPLATE',
      'TEMPLATE_NOT_APPROVED',
      'MISSING_REQUIRED_VARIABLE',
      'INVALID_PHONE_NUMBER',
      'INSUFFICIENT_BALANCE',
      'UNAUTHORIZED',
    ];
  };
  
  'POST /api/v1/kakao/brandtalk/send': {
    method: 'POST';
    path: '/api/v1/kakao/brandtalk/send';
    request: SendBrandtalkRequestDTO;
    response: SendBrandtalkResponseDTO;
    errors: [
      'NO_TEMPLATE',
      'TEMPLATE_INACTIVE',
      'INVALID_TEMPLATE_TYPE',
      'INVALID_PHONE_NUMBER',
      'INSUFFICIENT_BALANCE',
      'UNAUTHORIZED',
    ];
  };
}
```

---

## 4. 데이터 모델

### 4.1 엔티티 정의
```typescript
// Prisma Schema
model KakaoMessage {
  id                String   @id @default(uuid())
  userId            String
  sendType          String   // ALIMTALK, BRANDTALK
  channelId         String
  templateId        String
  recipientCount    Int
  successCount      Int      @default(0)
  failCount         Int      @default(0)
  cost              Decimal
  sendMode          String   // IMMEDIATE, SCHEDULED
  scheduledAt       DateTime?
  status            String   // PENDING, PROCESSING, COMPLETED, FAILED
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  user              User     @relation(fields: [userId], references: [id])
  details           KakaoMessageDetail[]
  
  @@index([userId])
  @@index([status])
  @@index([createdAt])
}

model KakaoMessageDetail {
  id                String   @id @default(uuid())
  messageId         String
  recipientNumber   String
  variables         Json?    // 변수 값
  status            String   // PENDING, SENT, DELIVERED, FAILED
  kakaoMessageId    String?
  alternativeSent   Boolean  @default(false)
  errorCode         String?
  errorMessage      String?
  sentAt            DateTime?
  deliveredAt       DateTime?
  createdAt         DateTime @default(now())
  
  message           KakaoMessage @relation(fields: [messageId], references: [id], onDelete: Cascade)
  
  @@index([messageId])
  @@index([recipientNumber])
  @@index([status])
}
```

### 4.2 DTO 정의
```typescript
export class TemplateCheckRequestDTO {
  @IsString()
  @IsNotEmpty()
  channelId: string;
  
  @IsEnum(['ALIMTALK', 'BRANDTALK'])
  sendType: string;
}

export class SendAlimtalkRequestDTO {
  @IsString()
  @IsNotEmpty()
  channelId: string;
  
  @IsString()
  @IsNotEmpty()
  templateId: string;
  
  @IsObject()
  variables: Record<string, string>;
  
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(10000)
  @IsString({ each: true })
  recipientNumbers: string[];
  
  @IsString()
  @IsNotEmpty()
  alternativeMessage: string;
  
  @IsEnum(['IMMEDIATE', 'SCHEDULED'])
  sendMode: string;
  
  @IsOptional()
  @IsDateString()
  scheduledAt?: string;
}

export class SendBrandtalkRequestDTO {
  @IsString()
  @IsNotEmpty()
  channelId: string;
  
  @IsString()
  @IsNotEmpty()
  templateId: string;
  
  @IsOptional()
  @IsObject()
  variables?: Record<string, string>;
  
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];
  
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(10000)
  @IsString({ each: true })
  recipientNumbers: string[];
  
  @IsOptional()
  @IsString()
  alternativeMessage?: string;
  
  @IsEnum(['IMMEDIATE', 'SCHEDULED'])
  sendMode: string;
  
  @IsOptional()
  @IsDateString()
  scheduledAt?: string;
}
```

---

## 5. 핵심 컴포넌트/서비스 명세

### 5.1 주요 서비스

#### TemplateCheckService
```typescript
@Injectable()
export class TemplateCheckService {
  constructor(
    private readonly templateRepository: KakaoTemplateRepository,
    private readonly cacheService: CacheService,
  ) {}
  
  async checkTemplate(
    channelId: string,
    sendType: 'ALIMTALK' | 'BRANDTALK',
    userId: string
  ): Promise<TemplateCheckResult> {
    // 캐시 키 생성
    const cacheKey = `template:check:${userId}:${channelId}:${sendType}`;
    
    // 캐시에서 조회
    const cached = await this.cacheService.get<TemplateCheckResult>(cacheKey);
    if (cached) {
      return cached;
    }
    
    // 템플릿 조회
    const templates = await this.templateRepository.findMany({
      where: {
        channelId,
        sendType,
        userId,
        ...(sendType === 'ALIMTALK' 
          ? { status: 'APPROVED' }
          : { status: 'ACTIVE' }
        ),
      },
    });
    
    const result: TemplateCheckResult = {
      hasTemplate: templates.length > 0,
      templateCount: templates.length,
      message: templates.length === 0 
        ? (sendType === 'ALIMTALK'
            ? '등록된 알림톡 템플릿이 없습니다'
            : '등록된 브랜드톡 템플릿이 없습니다')
        : undefined,
    };
    
    // 캐시 저장 (5분)
    await this.cacheService.set(cacheKey, result, 300);
    
    return result;
  }
}
```

#### AlimtalkService
```typescript
@Injectable()
export class AlimtalkService {
  constructor(
    private readonly templateRepository: KakaoTemplateRepository,
    private readonly kakaoAPIClient: KakaoAPIClient,
    private readonly variableReplacerService: VariableReplacerService,
    private readonly validatorService: TemplateValidatorService,
    private readonly paymentService: PaymentService,
    private readonly addressBookService: AddressBookService,
    private readonly messageQueueService: MessageQueueService,
  ) {}
  
  async sendAlimtalk(
    request: SendAlimtalkRequestDTO,
    userId: string
  ): Promise<SendAlimtalkResponseDTO> {
    // 1. 템플릿 존재 여부 확인 (최우선)
    const template = await this.templateRepository.findOne({
      where: {
        id: request.templateId,
        channelId: request.channelId,
        userId,
        sendType: 'ALIMTALK',
        status: 'APPROVED',
      },
    });
    
    if (!template) {
      throw new BadRequestException('승인된 템플릿을 찾을 수 없습니다.');
    }
    
    // 2. 템플릿 검증
    await this.validatorService.validateTemplate(template, 'ALIMTALK');
    
    // 3. 변수 검증
    const variableValidation = this.variableReplacerService.validateVariables(
      template,
      request.variables
    );
    
    if (!variableValidation.isValid) {
      throw new BadRequestException(variableValidation.errors[0]);
    }
    
    // 4. 수신번호 검증 및 필터링
    const validRecipients = await this.validateAndFilterRecipients(
      request.recipientNumbers,
      userId
    );
    
    if (validRecipients.length === 0) {
      throw new BadRequestException('유효한 수신번호가 없습니다.');
    }
    
    // 5. 비용 계산
    const cost = await this.calculateCost({
      recipientCount: validRecipients.length,
      sendType: 'ALIMTALK',
    });
    
    // 6. 잔액 확인
    const balance = await this.paymentService.getBalance(userId);
    if (balance < cost) {
      throw new BadRequestException('잔액이 부족합니다.');
    }
    
    // 7. 발송 내역 생성
    const message = await this.messageRepository.create({
      userId,
      sendType: 'ALIMTALK',
      channelId: request.channelId,
      templateId: request.templateId,
      recipientCount: validRecipients.length,
      cost,
      sendMode: request.sendMode,
      scheduledAt: request.scheduledAt ? new Date(request.scheduledAt) : null,
      status: request.sendMode === 'SCHEDULED' ? 'PENDING' : 'PROCESSING',
    });
    
    // 8. 발송 상세 내역 생성
    await this.messageRepository.createDetails(
      message.id,
      validRecipients.map(recipient => ({
        recipientNumber: recipient,
        variables: request.variables,
        status: 'PENDING',
      }))
    );
    
    // 9. 즉시 발송 또는 예약 발송
    if (request.sendMode === 'IMMEDIATE') {
      // 큐에 추가
      await this.messageQueueService.enqueueMessage({
        messageId: message.id,
        sendType: 'ALIMTALK',
        priority: 1,
      });
      
      // 잔액 차감
      await this.paymentService.deductBalance(userId, cost, {
        type: 'KAKAO_MESSAGE_SEND',
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
  
  private async calculateCost(request: CostCalculationRequest): Promise<number> {
    const unitPrice = 30; // 알림톡 단가
    return unitPrice * request.recipientCount;
  }
}
```

#### BrandtalkService
```typescript
@Injectable()
export class BrandtalkService {
  constructor(
    private readonly templateRepository: KakaoTemplateRepository,
    private readonly kakaoAPIClient: KakaoAPIClient,
    private readonly variableReplacerService: VariableReplacerService,
    private readonly validatorService: TemplateValidatorService,
    private readonly paymentService: PaymentService,
    private readonly addressBookService: AddressBookService,
    private readonly messageQueueService: MessageQueueService,
  ) {}
  
  async sendBrandtalk(
    request: SendBrandtalkRequestDTO,
    userId: string
  ): Promise<SendBrandtalkResponseDTO> {
    // 1. 템플릿 존재 여부 확인 (최우선)
    const template = await this.templateRepository.findOne({
      where: {
        id: request.templateId,
        channelId: request.channelId,
        userId,
        sendType: 'BRANDTALK',
        status: 'ACTIVE', // 브랜드톡은 활성화된 템플릿만 사용
      },
    });
    
    if (!template) {
      throw new BadRequestException('활성화된 템플릿을 찾을 수 없습니다.');
    }
    
    // 2. 템플릿 검증 (브랜드톡은 승인 절차 없음)
    await this.validatorService.validateTemplate(template, 'BRANDTALK');
    
    // 3. 변수 검증 (선택사항)
    if (request.variables && Object.keys(request.variables).length > 0) {
      const variableValidation = this.variableReplacerService.validateVariables(
        template,
        request.variables
      );
      
      if (!variableValidation.isValid) {
        throw new BadRequestException(variableValidation.errors[0]);
      }
    }
    
    // 4. 수신번호 검증 및 필터링
    const validRecipients = await this.validateAndFilterRecipients(
      request.recipientNumbers,
      userId
    );
    
    if (validRecipients.length === 0) {
      throw new BadRequestException('유효한 수신번호가 없습니다.');
    }
    
    // 5. 비용 계산
    const cost = await this.calculateCost({
      recipientCount: validRecipients.length,
      sendType: 'BRANDTALK',
      templateType: template.type,
    });
    
    // 6. 잔액 확인
    const balance = await this.paymentService.getBalance(userId);
    if (balance < cost) {
      throw new BadRequestException('잔액이 부족합니다.');
    }
    
    // 7. 발송 내역 생성
    const message = await this.messageRepository.create({
      userId,
      sendType: 'BRANDTALK',
      channelId: request.channelId,
      templateId: request.templateId,
      recipientCount: validRecipients.length,
      cost,
      sendMode: request.sendMode,
      scheduledAt: request.scheduledAt ? new Date(request.scheduledAt) : null,
      status: request.sendMode === 'SCHEDULED' ? 'PENDING' : 'PROCESSING',
    });
    
    // 8. 발송 상세 내역 생성
    await this.messageRepository.createDetails(
      message.id,
      validRecipients.map(recipient => ({
        recipientNumber: recipient,
        variables: request.variables,
        status: 'PENDING',
      }))
    );
    
    // 9. 즉시 발송 또는 예약 발송
    if (request.sendMode === 'IMMEDIATE') {
      // 큐에 추가
      await this.messageQueueService.enqueueMessage({
        messageId: message.id,
        sendType: 'BRANDTALK',
        priority: 1,
      });
      
      // 잔액 차감
      await this.paymentService.deductBalance(userId, cost, {
        type: 'KAKAO_MESSAGE_SEND',
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
  
  private async calculateCost(request: BrandtalkCostCalculationRequest): Promise<number> {
    // 템플릿 타입별 단가 차등 적용
    const unitPrices = {
      BASIC: 30,
      HIGHLIGHT: 35,
      IMAGE: 40,
      WIDE: 45,
      CAROUSEL: 50,
    };
    
    const unitPrice = unitPrices[request.templateType] || 30;
    return unitPrice * request.recipientCount;
  }
}
```

#### VariableReplacerService
```typescript
@Injectable()
export class VariableReplacerService {
  replaceVariables(
    content: string,
    variables: Record<string, string>
  ): string {
    let replaced = content;
    
    Object.entries(variables).forEach(([key, value]) => {
      const pattern = new RegExp(`#\\{${key}\\}`, 'g');
      replaced = replaced.replace(pattern, value);
    });
    
    return replaced;
  }
  
  validateVariables(
    template: AlimtalkTemplate | BrandtalkTemplate,
    variables: Record<string, string>
  ): ValidationResult {
    const errors: string[] = [];
    
    // 필수 변수 확인
    if (template.variables && template.variables.length > 0) {
      template.variables.forEach(variable => {
        if (!variables[variable] || variables[variable].trim() === '') {
          errors.push(`필수 변수 '${variable}'가 입력되지 않았습니다.`);
        }
      });
    }
    
    // 변수 값 길이 검증
    Object.entries(variables).forEach(([key, value]) => {
      if (value.length > 100) {
        errors.push(`변수 '${key}'의 값이 너무 깁니다. (최대 100자)`);
      }
    });
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
```

---

## 6. 이벤트 및 메시징

### 6.1 발행 이벤트
```typescript
enum KakaoServiceEvents {
  TEMPLATE_CHECKED = 'kakao.template.checked',
  MESSAGE_CREATED = 'kakao.message.created',
  MESSAGE_SENT = 'kakao.message.sent',
  MESSAGE_FAILED = 'kakao.message.failed',
  MESSAGE_COMPLETED = 'kakao.message.completed',
}

@EventPattern(KakaoServiceEvents.MESSAGE_SENT)
export class KakaoMessageSentEvent {
  messageId: string;
  userId: string;
  sendType: string;
  successCount: number;
  failCount: number;
  timestamp: Date;
}
```

### 6.2 구독 이벤트
```typescript
@EventPattern('template.approved')
async handleTemplateApproved(data: TemplateApprovedEvent) {
  // 템플릿 승인 시 캐시 무효화
  const cacheKey = `template:check:${data.userId}:${data.channelId}:ALIMTALK`;
  await this.cacheService.del(cacheKey);
}

@EventPattern('template.created')
async handleTemplateCreated(data: TemplateCreatedEvent) {
  // 템플릿 생성 시 캐시 무효화
  const cacheKey = `template:check:${data.userId}:${data.channelId}:${data.sendType}`;
  await this.cacheService.del(cacheKey);
}
```

---

## 7. 에러 처리

### 7.1 에러 코드 정의
```typescript
enum KakaoServiceErrorCode {
  NO_TEMPLATE = 'KKO_SVC_001',
  TEMPLATE_NOT_APPROVED = 'KKO_SVC_002',
  TEMPLATE_INACTIVE = 'KKO_SVC_003',
  MISSING_REQUIRED_VARIABLE = 'KKO_SVC_004',
  INVALID_PHONE_NUMBER = 'KKO_SVC_005',
  INSUFFICIENT_BALANCE = 'KKO_SVC_006',
  CHANNEL_NOT_FOUND = 'KKO_SVC_007',
  INVALID_TEMPLATE_TYPE = 'KKO_SVC_008',
  KAKAO_API_ERROR = 'KKO_SVC_009',
}
```

### 7.2 에러 처리 전략
- **템플릿 부재 에러**: 명확한 에러 메시지, 템플릿 등록 안내
- **템플릿 미승인 에러**: 승인 대기 안내, 예상 소요 시간 안내
- **변수 누락 에러**: 누락된 변수 목록 제공
- **카카오 API 에러**: 재시도 로직 적용 (최대 3회)
- **시스템 에러**: 에러 로그 기록, 알림 발송

---

## 8. 테스트 전략

### 8.1 단위 테스트
```typescript
describe('TemplateCheckService', () => {
  it('should return false when no template', async () => {
    // ...
  });
  
  it('should cache template check result', async () => {
    // ...
  });
});

describe('AlimtalkService', () => {
  it('should throw error when template not approved', async () => {
    // ...
  });
});
```

### 8.2 통합 테스트
- 전체 발송 플로우 테스트
- 템플릿 존재 여부 확인 테스트
- 카카오 API 연동 테스트
- 큐 처리 테스트

### 8.3 테스트 커버리지 목표
- **단위 테스트**: 85% 이상
- **통합 테스트**: 핵심 플로우 100%

---

## 9. 성능 최적화

### 9.1 최적화 기법
- **템플릿 존재 여부 캐싱**: 채널별 템플릿 존재 여부 5분 캐싱
- **배치 처리**: 대량 발송 시 배치 단위로 처리
- **비동기 처리**: 큐를 통한 비동기 발송
- **인덱스**: 데이터베이스 인덱스 최적화

---

## 10. 보안 고려사항

### 10.1 인증/인가
- JWT 토큰 검증
- 사용자별 채널/템플릿 접근 권한 확인
- 발송 내역은 본인만 조회 가능

### 10.2 데이터 보호
- 개인정보 암호화 저장
- SQL Injection 방지 (Prisma ORM 사용)
- XSS 방지 (입력값 검증)

---

**문서 버전**: 2.0  
**작성일**: 2024-11-19  
**최종 수정일**: 2024-11-19
