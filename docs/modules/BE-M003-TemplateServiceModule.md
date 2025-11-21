# BE-M003: TemplateServiceModule 상세 개발 설계서

## 1. 모듈 개요

### 1.1 모듈 식별 정보
- **모듈 ID**: BE-M003
- **모듈명**: TemplateServiceModule (템플릿 관리 서비스 모듈)
- **담당 개발자**: Backend 개발자
- **예상 개발 기간**: 15일
- **우선순위**: P1

### 1.2 모듈 목적 및 범위
- **핵심 기능**: 
  - 문자 템플릿 CRUD
  - 알림톡 템플릿 CRUD (발신프로필별 관리, 카카오 검수 연동)
  - 브랜드톡 템플릿 CRUD (발신프로필별 관리, 즉시 사용)
  - 템플릿 검색/필터링/정렬
  - 템플릿 복사
  - 템플릿 미리보기
  - 발신프로필별 템플릿 조회
- **비즈니스 가치**: 템플릿 관리 기능 제공, 발신프로필별 템플릿 관리

---

## 2. 기술 아키텍처

### 2.1 모듈 구조
```
TemplateServiceModule/
├── controllers/
│   ├── template.controller.ts
│   ├── alimtalk-template.controller.ts
│   └── brandtalk-template.controller.ts
├── services/
│   ├── template.service.ts
│   ├── alimtalk-template.service.ts
│   ├── brandtalk-template.service.ts
│   └── kakao-api.service.ts
├── entities/
│   ├── template.entity.ts
│   ├── alimtalk-template.entity.ts
│   └── brandtalk-template.entity.ts
├── dto/
│   ├── alimtalk-template.dto.ts
│   └── brandtalk-template.dto.ts
├── repositories/
│   ├── template.repository.ts
│   ├── alimtalk-template.repository.ts
│   └── brandtalk-template.repository.ts
├── validators/
│   ├── template.validator.ts
│   └── kakao-template.validator.ts
└── processors/
    └── kakao-template-processor.ts
```

---

## 3. 인터페이스 정의

### 3.1 외부 의존성
```typescript
interface ExternalDependencies {
  modules: [
    'BE-M002: KakaoServiceModule',      // 발신프로필 조회
    'BE-M007: UserServiceModule',       // 사용자 정보 조회
    'BE-M008: AuthServiceModule',       // 인증/인가
    'BE-M010: FileServiceModule',       // 이미지 업로드
  ];
  apis: [
    '카카오 비즈니스 API',                // 템플릿 검수 연동
  ];
  sharedComponents: [];
  utils: [];
}
```

### 3.2 제공 인터페이스
```typescript
export interface TemplateServiceInterface {
  services: {
    AlimtalkTemplateService: {
      getTemplates: (filters: AlimtalkTemplateFilters, userId: string) => Promise<AlimtalkTemplate[]>;
      getTemplate: (templateId: string, userId: string) => Promise<AlimtalkTemplate>;
      registerTemplate: (request: AlimtalkTemplateRegisterRequest, userId: string) => Promise<AlimtalkTemplate>;
      updateTemplate: (templateId: string, request: AlimtalkTemplateUpdateRequest, userId: string) => Promise<AlimtalkTemplate>;
      deleteTemplate: (templateId: string, userId: string) => Promise<void>;
      copyTemplate: (templateId: string, userId: string) => Promise<AlimtalkTemplate>;
      requestReview: (templateId: string, userId: string) => Promise<void>;
    };
    
    BrandtalkTemplateService: {
      getTemplates: (filters: BrandtalkTemplateFilters, userId: string) => Promise<BrandtalkTemplate[]>;
      getTemplate: (templateId: string, userId: string) => Promise<BrandtalkTemplate>;
      registerTemplate: (request: BrandtalkTemplateRegisterRequest, userId: string) => Promise<BrandtalkTemplate>;
      updateTemplate: (templateId: string, request: BrandtalkTemplateUpdateRequest, userId: string) => Promise<BrandtalkTemplate>;
      deleteTemplate: (templateId: string, userId: string) => Promise<void>;
      copyTemplate: (templateId: string, userId: string) => Promise<BrandtalkTemplate>;
    };
  };
}
```

### 3.3 API 명세
```typescript
// 알림톡 템플릿 목록 조회
interface AlimtalkTemplateListAPI {
  'GET /api/v1/templates/alimtalk': {
    request: {
      profileId?: string;
      status?: 'PENDING' | 'APPROVED' | 'REJECTED';
      search?: string;
      category?: string;
      messageType?: string;
      page?: number;
      limit?: number;
    };
    response: {
      templates: AlimtalkTemplate[];
      total: number;
      page: number;
      limit: number;
    };
    errors: ['UNAUTHORIZED', 'PROFILE_NOT_FOUND'];
  };
}

// 알림톡 템플릿 등록
interface AlimtalkTemplateRegisterAPI {
  'POST /api/v1/templates/alimtalk': {
    request: AlimtalkTemplateRegisterRequestDTO;
    response: AlimtalkTemplateDTO;
    errors: [
      'PROFILE_NOT_FOUND',
      'TEMPLATE_CODE_DUPLICATE',
      'INVALID_TEMPLATE_FORMAT',
      'KAKAO_API_ERROR',
    ];
  };
}

// 브랜드톡 템플릿 목록 조회
interface BrandtalkTemplateListAPI {
  'GET /api/v1/templates/brandtalk': {
    request: {
      profileId?: string;
      status?: 'ACTIVE' | 'INACTIVE';
      templateType?: string;
      search?: string;
      page?: number;
      limit?: number;
    };
    response: {
      templates: BrandtalkTemplate[];
      total: number;
      page: number;
      limit: number;
    };
    errors: ['UNAUTHORIZED', 'PROFILE_NOT_FOUND'];
  };
}

// 브랜드톡 템플릿 등록
interface BrandtalkTemplateRegisterAPI {
  'POST /api/v1/templates/brandtalk': {
    request: BrandtalkTemplateRegisterRequestDTO;
    response: BrandtalkTemplateDTO;
    errors: [
      'PROFILE_NOT_FOUND',
      'INVALID_TEMPLATE_FORMAT',
      'IMAGE_UPLOAD_FAILED',
    ];
  };
}
```

---

## 4. 데이터 모델

### 4.1 엔티티 정의
```typescript
// Prisma Schema
model AlimtalkTemplate {
  id                String   @id @default(uuid())
  userId            String
  profileId         String
  templateCode      String
  templateName      String
  categoryMain      String
  categorySub       String?
  messageType       String   // BASIC, HIGHLIGHT, IMAGE
  highlightType     String?  // TEXT, IMAGE, ITEM_LIST
  content           String
  variables         String[] // 변수 목록
  buttons           Json?    // 버튼 정보
  imageUrl          String?
  quickReply        Json?    // 바로연결 정보
  isSecure          Boolean  @default(false)
  status            String   // PENDING, APPROVED, REJECTED
  rejectReason      String?
  approvedAt        DateTime?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  user              User     @relation(fields: [userId], references: [id])
  profile           KakaoProfile @relation(fields: [profileId], references: [id])
  
  @@unique([userId, profileId, templateCode])
  @@index([userId])
  @@index([profileId])
  @@index([status])
}

model BrandtalkTemplate {
  id                String   @id @default(uuid())
  userId            String
  profileId         String
  templateCode      String
  templateName      String
  description       String?
  templateType      String   // TEXT, IMAGE, WIDE_IMAGE, WIDE_LIST, CAROUSEL, COMMERCE, CARVAS
  content           String
  images            String[] // 이미지 URL 목록
  buttons           Json?    // 버튼 정보
  status            String   // ACTIVE, INACTIVE
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  user              User     @relation(fields: [userId], references: [id])
  profile           KakaoProfile @relation(fields: [profileId], references: [id])
  
  @@unique([userId, profileId, templateCode])
  @@index([userId])
  @@index([profileId])
  @@index([status])
}
```

### 4.2 DTO 정의
```typescript
export class AlimtalkTemplateRegisterRequestDTO {
  @IsString()
  @IsNotEmpty()
  profileId: string;
  
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  @Matches(/^[a-zA-Z0-9_]+$/, { message: '템플릿 코드는 영문, 숫자, 언더스코어만 허용됩니다' })
  templateCode: string;
  
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  templateName: string;
  
  @IsString()
  @IsNotEmpty()
  categoryMain: string;
  
  @IsOptional()
  @IsString()
  categorySub?: string;
  
  @IsEnum(['BASIC', 'HIGHLIGHT', 'IMAGE'])
  messageType: string;
  
  @IsOptional()
  @IsEnum(['TEXT', 'IMAGE', 'ITEM_LIST'])
  highlightType?: string;
  
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  content: string;
  
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  variables?: string[];
  
  @IsOptional()
  @IsArray()
  buttons?: ButtonDTO[];
  
  @IsOptional()
  @IsString()
  imageUrl?: string;
  
  @IsOptional()
  quickReply?: QuickReplyDTO;
  
  @IsBoolean()
  @IsOptional()
  isSecure?: boolean;
}

export class BrandtalkTemplateRegisterRequestDTO {
  @IsString()
  @IsNotEmpty()
  profileId: string;
  
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  templateName: string;
  
  @IsOptional()
  @IsString()
  @MaxLength(200)
  description?: string;
  
  @IsEnum(['TEXT', 'IMAGE', 'WIDE_IMAGE', 'WIDE_LIST', 'CAROUSEL', 'COMMERCE', 'CARVAS'])
  templateType: string;
  
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  content: string;
  
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];
  
  @IsOptional()
  @IsArray()
  buttons?: ButtonDTO[];
}
```

---

## 5. 핵심 컴포넌트/서비스 명세

### 5.1 주요 서비스

#### AlimtalkTemplateService
```typescript
@Injectable()
export class AlimtalkTemplateService {
  constructor(
    private readonly templateRepository: AlimtalkTemplateRepository,
    private readonly profileRepository: KakaoProfileRepository,
    private readonly kakaoAPIService: KakaoAPIService,
    private readonly validatorService: TemplateValidatorService,
  ) {}
  
  async getTemplates(
    filters: AlimtalkTemplateFilters,
    userId: string
  ): Promise<AlimtalkTemplate[]> {
    // 발신프로필 확인
    if (filters.profileId) {
      const profile = await this.profileRepository.findOne({
        where: { id: filters.profileId, userId },
      });
      
      if (!profile) {
        throw new NotFoundException('발신프로필을 찾을 수 없습니다.');
      }
    }
    
    return this.templateRepository.findMany({
      where: {
        userId,
        ...(filters.profileId && { profileId: filters.profileId }),
        ...(filters.status && { status: filters.status }),
        ...(filters.search && {
          OR: [
            { templateName: { contains: filters.search } },
            { templateCode: { contains: filters.search } },
          ],
        }),
        ...(filters.category && { categoryMain: filters.category }),
        ...(filters.messageType && { messageType: filters.messageType }),
      },
      orderBy: { createdAt: 'desc' },
      skip: (filters.page - 1) * filters.limit,
      take: filters.limit,
    });
  }
  
  async registerTemplate(
    request: AlimtalkTemplateRegisterRequestDTO,
    userId: string
  ): Promise<AlimtalkTemplate> {
    // 발신프로필 확인
    const profile = await this.profileRepository.findOne({
      where: { id: request.profileId, userId },
    });
    
    if (!profile) {
      throw new NotFoundException('발신프로필을 찾을 수 없습니다.');
    }
    
    // 템플릿 코드 중복 체크
    const existing = await this.templateRepository.findOne({
      where: {
        userId,
        profileId: request.profileId,
        templateCode: request.templateCode,
      },
    });
    
    if (existing) {
      throw new BadRequestException('이미 사용 중인 템플릿 코드입니다.');
    }
    
    // 템플릿 검증
    await this.validatorService.validateAlimtalkTemplate(request);
    
    // 템플릿 등록
    const template = await this.templateRepository.create({
      userId,
      profileId: request.profileId,
      templateCode: request.templateCode,
      templateName: request.templateName,
      categoryMain: request.categoryMain,
      categorySub: request.categorySub,
      messageType: request.messageType,
      highlightType: request.highlightType,
      content: request.content,
      variables: request.variables || [],
      buttons: request.buttons || [],
      imageUrl: request.imageUrl,
      quickReply: request.quickReply,
      isSecure: request.isSecure || false,
      status: 'PENDING',
    });
    
    return template;
  }
  
  async requestReview(
    templateId: string,
    userId: string
  ): Promise<void> {
    const template = await this.templateRepository.findOne({
      where: { id: templateId, userId },
    });
    
    if (!template) {
      throw new NotFoundException('템플릿을 찾을 수 없습니다.');
    }
    
    // 카카오 API로 검수 요청
    await this.kakaoAPIService.requestTemplateReview({
      profileId: template.profile.profileId,
      templateCode: template.templateCode,
      template: template,
    });
    
    // 상태 업데이트
    await this.templateRepository.update({
      where: { id: templateId },
      data: { status: 'PENDING' },
    });
  }
}
```

#### BrandtalkTemplateService
```typescript
@Injectable()
export class BrandtalkTemplateService {
  constructor(
    private readonly templateRepository: BrandtalkTemplateRepository,
    private readonly profileRepository: KakaoProfileRepository,
    private readonly validatorService: TemplateValidatorService,
    private readonly fileService: FileService,
  ) {}
  
  async getTemplates(
    filters: BrandtalkTemplateFilters,
    userId: string
  ): Promise<BrandtalkTemplate[]> {
    // 발신프로필 확인
    if (filters.profileId) {
      const profile = await this.profileRepository.findOne({
        where: { id: filters.profileId, userId },
      });
      
      if (!profile) {
        throw new NotFoundException('발신프로필을 찾을 수 없습니다.');
      }
    }
    
    return this.templateRepository.findMany({
      where: {
        userId,
        ...(filters.profileId && { profileId: filters.profileId }),
        ...(filters.status && { status: filters.status }),
        ...(filters.templateType && { templateType: filters.templateType }),
        ...(filters.search && {
          OR: [
            { templateName: { contains: filters.search } },
            { content: { contains: filters.search } },
          ],
        }),
      },
      orderBy: { createdAt: 'desc' },
      skip: (filters.page - 1) * filters.limit,
      take: filters.limit,
    });
  }
  
  async registerTemplate(
    request: BrandtalkTemplateRegisterRequestDTO,
    userId: string
  ): Promise<BrandtalkTemplate> {
    // 발신프로필 확인
    const profile = await this.profileRepository.findOne({
      where: { id: request.profileId, userId },
    });
    
    if (!profile) {
      throw new NotFoundException('발신프로필을 찾을 수 없습니다.');
    }
    
    // 템플릿 코드 자동 생성
    const templateCode = await this.generateTemplateCode(userId, request.profileId);
    
    // 이미지 업로드 처리
    const imageUrls: string[] = [];
    if (request.images && request.images.length > 0) {
      for (const image of request.images) {
        const url = await this.fileService.uploadImage(image);
        imageUrls.push(url);
      }
    }
    
    // 템플릿 검증
    await this.validatorService.validateBrandtalkTemplate(request);
    
    // 템플릿 등록
    const template = await this.templateRepository.create({
      userId,
      profileId: request.profileId,
      templateCode,
      templateName: request.templateName,
      description: request.description,
      templateType: request.templateType,
      content: request.content,
      images: imageUrls,
      buttons: request.buttons || [],
      status: 'ACTIVE',
    });
    
    return template;
  }
  
  private async generateTemplateCode(
    userId: string,
    profileId: string
  ): Promise<string> {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `BRAND_${timestamp}_${random}`;
  }
}
```

---

## 6. 에러 처리

### 6.1 에러 코드 정의
```typescript
enum TemplateServiceErrorCode {
  PROFILE_NOT_FOUND = 'TPL_SVC_001',
  TEMPLATE_NOT_FOUND = 'TPL_SVC_002',
  TEMPLATE_CODE_DUPLICATE = 'TPL_SVC_003',
  INVALID_TEMPLATE_FORMAT = 'TPL_SVC_004',
  KAKAO_API_ERROR = 'TPL_SVC_005',
  IMAGE_UPLOAD_FAILED = 'TPL_SVC_006',
  TEMPLATE_ALREADY_APPROVED = 'TPL_SVC_007',
}
```

### 6.2 에러 처리 전략
- 발신프로필 미선택: 명확한 에러 메시지
- 템플릿 코드 중복: 다른 코드 입력 유도
- 카카오 API 오류: 재시도 로직 적용
- 이미지 업로드 실패: 재업로드 안내

---

## 7. 테스트 전략

### 7.1 단위 테스트
- 템플릿 검증 로직 테스트
- 발신프로필 확인 로직 테스트
- 템플릿 CRUD 테스트

### 7.2 통합 테스트
- 템플릿 등록 플로우 테스트
- 발신프로필별 템플릿 조회 테스트
- 카카오 API 연동 테스트

---

**문서 버전**: 2.0  
**작성일**: 2024-11-19  
**최종 수정일**: 2024-11-19

