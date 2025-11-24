# BE-M004: AddressBookServiceModule 상세 개발 설계서

## 1. 모듈 개요

### 1.1 모듈 식별 정보
- **모듈 ID**: BE-M004
- **모듈명**: AddressBookServiceModule (주소록 관리 서비스 모듈)
- **담당 개발자**: Backend 개발자
- **예상 개발 기간**: 12일
- **우선순위**: P0

### 1.2 모듈 목적 및 범위
- **핵심 기능**: 
  - 주소록 CRUD
  - 그룹 관리 (그룹명 수정, 그룹 삭제)
  - 엑셀 업로드/다운로드 처리 (XLSX 형식)
  - 엑셀 샘플 파일 생성
  - 수신거부 번호 필터링
  - 중복 번호 처리
- **비즈니스 가치**: 수신자 정보 관리 및 발송 시 활용

### 1.3 목표 사용자
- **주 사용자 그룹**: Frontend 모듈 (FE-M004)

---

## 2. 기술 아키텍처

### 2.1 모듈 구조
```
AddressBookServiceModule/
├── controllers/
│   └── address-book.controller.ts
├── services/
│   ├── address-book.service.ts
│   ├── group.service.ts
│   └── excel.service.ts
├── entities/
│   ├── address.entity.ts
│   └── group.entity.ts
├── repositories/
│   └── address-book.repository.ts
└── validators/
    └── phone.validator.ts
```

### 2.2 기술 스택
- **프레임워크**: NestJS 10+
- **데이터베이스**: PostgreSQL, Prisma ORM
- **엑셀 처리**: xlsx 라이브러리

---

## 3. 인터페이스 정의

### 3.1 외부 의존성
```typescript
interface ExternalDependencies {
  modules: [
    'BE-M007: UserServiceModule',
    'BE-M008: AuthServiceModule',
  ];
  apis: [];
  sharedComponents: [];
  utils: [];
}
```

### 3.2 제공 인터페이스
```typescript
export interface AddressBookServiceInterface {
  services: {
    AddressBookService: {
      getAddresses: (userId: string, groupId?: string) => Promise<Address[]>;
      createAddress: (userId: string, data: CreateAddressDTO) => Promise<Address>;
      updateAddress: (userId: string, id: string, data: UpdateAddressDTO) => Promise<Address>;
      deleteAddress: (userId: string, id: string) => Promise<void>;
      uploadExcel: (userId: string, file: Express.Multer.File) => Promise<UploadResult>;
    };
    
    GroupService: {
      getGroups: (userId: string) => Promise<Group[]>;
      createGroup: (userId: string, data: CreateGroupDTO) => Promise<Group>;
      updateGroup: (userId: string, id: string, data: UpdateGroupDTO) => Promise<Group>;
      deleteGroup: (userId: string, id: string) => Promise<void>;
    };
    
    ExcelService: {
      downloadSample: () => Promise<Buffer>;
      parseExcelFile: (file: Express.Multer.File) => Promise<ExcelRow[]>;
    };
  };
}
```

---

## 4. 데이터 모델

### 4.1 엔티티 정의
```typescript
// Prisma Schema
model Address {
  id            String   @id @default(uuid())
  userId        String
  groupId       String
  name          String
  phoneNumber   String
  memo          String?
  isBlocked     Boolean  @default(false)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  user          User     @relation(fields: [userId], references: [id])
  group         Group    @relation(fields: [groupId], references: [id])
  
  @@index([userId])
  @@index([groupId])
  @@index([phoneNumber])
}

model Group {
  id            String   @id @default(uuid())
  userId        String
  name          String
  description   String?
  sortOrder     Int      @default(0)
  createdAt     DateTime @default(now())
  
  user          User     @relation(fields: [userId], references: [id])
  addresses     Address[]
  
  @@index([userId])
}
```

---

## 5. 핵심 컴포넌트/서비스 명세

### 5.1 주요 서비스

#### AddressBookService
```typescript
@Injectable()
export class AddressBookService {
  constructor(
    private readonly addressRepository: AddressRepository,
    private readonly groupRepository: GroupRepository,
    private readonly blockedNumberService: BlockedNumberService,
  ) {}
  
  async getAddresses(userId: string, groupId?: string): Promise<Address[]> {
    return this.addressRepository.findMany({
      where: {
        userId,
        ...(groupId && { groupId }),
      },
      include: {
        group: true,
      },
    });
  }
  
  async createAddress(userId: string, data: CreateAddressDTO): Promise<Address> {
    // 전화번호 검증
    if (!this.isValidPhoneNumber(data.phoneNumber)) {
      throw new BadRequestException('유효하지 않은 전화번호입니다.');
    }
    
    // 중복 확인
    const existing = await this.addressRepository.findFirst({
      where: {
        userId,
        phoneNumber: data.phoneNumber,
      },
    });
    
    if (existing) {
      throw new ConflictException('이미 등록된 전화번호입니다.');
    }
    
    // 수신거부 번호 확인
    const isBlocked = await this.blockedNumberService.isBlocked(data.phoneNumber);
    
    return this.addressRepository.create({
      data: {
        ...data,
        userId,
        isBlocked,
      },
    });
  }
  
  async uploadExcel(
    userId: string,
    file: Express.Multer.File
  ): Promise<UploadResult> {
    // 엑셀 파싱
    const rows = await this.parseExcelFile(file);
    
    // 검증 및 필터링
    const validAddresses: CreateAddressDTO[] = [];
    const errors: UploadError[] = [];
    
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      
      // 전화번호 검증
      if (!this.isValidPhoneNumber(row.phoneNumber)) {
        errors.push({
          row: i + 1,
          phoneNumber: row.phoneNumber,
          error: '유효하지 않은 전화번호',
        });
        continue;
      }
      
      // 중복 확인
      const existing = await this.addressRepository.findFirst({
        where: {
          userId,
          phoneNumber: row.phoneNumber,
        },
      });
      
      if (existing) {
        errors.push({
          row: i + 1,
          phoneNumber: row.phoneNumber,
          error: '이미 등록된 번호',
        });
        continue;
      }
      
      validAddresses.push({
        groupId: row.groupId,
        name: row.name,
        phoneNumber: row.phoneNumber,
        memo: row.memo,
      });
    }
    
    // 일괄 저장
    const created = await this.addressRepository.createMany({
      data: validAddresses.map(addr => ({
        ...addr,
        userId,
      })),
    });
    
    return {
      total: rows.length,
      success: created.count,
      failed: errors.length,
      errors,
    };
  }
  
  private async parseExcelFile(file: Express.Multer.File): Promise<ExcelRow[]> {
    // xlsx 라이브러리로 파싱
    // ...
  }
  
  private isValidPhoneNumber(phoneNumber: string): boolean {
    const pattern = /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/;
    return pattern.test(phoneNumber);
  }
}
```

---

## 6. 이벤트 및 메시징

### 6.1 발행 이벤트
```typescript
enum AddressBookEvents {
  ADDRESS_CREATED = 'addressbook.address.created',
  ADDRESS_UPDATED = 'addressbook.address.updated',
  ADDRESS_DELETED = 'addressbook.address.deleted',
  GROUP_CREATED = 'addressbook.group.created',
  GROUP_UPDATED = 'addressbook.group.updated',
  GROUP_DELETED = 'addressbook.group.deleted',
}
```

---

## 7. 에러 처리

### 7.1 에러 코드 정의
```typescript
enum AddressBookErrorCode {
  INVALID_PHONE_NUMBER = 'ADDR_SVC_001',
  DUPLICATE_PHONE_NUMBER = 'ADDR_SVC_002',
  GROUP_NOT_FOUND = 'ADDR_SVC_003',
  EXCEL_PARSE_ERROR = 'ADDR_SVC_004',
}
```

---

## 8. 테스트 전략

### 8.1 단위 테스트
- 주소록 CRUD 테스트
- 엑셀 업로드 테스트
- 검증 로직 테스트

### 8.2 테스트 커버리지 목표
- **단위 테스트**: 85% 이상

---

## 9. 성능 최적화

### 9.1 최적화 기법
- 대량 업로드 시 배치 처리
- 인덱스 최적화
- 캐싱 (그룹 목록)

---

## 10. 보안 고려사항

### 10.1 인증/인가
- 사용자별 데이터 접근 제어
- 본인 주소록만 조회/수정 가능

---

**문서 버전**: 1.1  
**작성일**: 2024-11-19  
**최종 수정일**: 2024-11-19

## 변경 이력

### 버전 1.1 (2024-11-19)
- Address 엔티티에서 email 필드 제거
- 그룹 관리 기능 추가 (그룹명 수정, 그룹 삭제)
- 엑셀 샘플 파일 생성 기능 추가 (XLSX 형식)
- ExcelService 인터페이스 추가

