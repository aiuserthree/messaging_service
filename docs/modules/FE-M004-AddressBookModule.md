# FE-M004: AddressBookModule 상세 개발 설계서

## 1. 모듈 개요

### 1.1 모듈 식별 정보
- **모듈 ID**: FE-M004
- **모듈명**: AddressBookModule (주소록 관리 모듈)
- **담당 개발자**: Frontend 개발자
- **예상 개발 기간**: 10일
- **우선순위**: P0

### 1.2 모듈 목적 및 범위
- **핵심 기능**: 
  - 주소록 그룹 관리 (그룹명 수정, 그룹 삭제)
  - 주소록 조회/추가/수정/삭제
  - 엑셀 업로드/다운로드 (XLSX 형식)
  - 엑셀 샘플 파일 다운로드
  - 주소록 검색 및 필터링
  - 수신거부 번호 연동
- **비즈니스 가치**: 수신자 정보를 효율적으로 관리하고 발송 시 활용
- **제외 범위**: 수신거부 관리 (별도 모듈), 주소록 추가 (별도 페이지)

### 1.3 목표 사용자
- **주 사용자 그룹**: 개인/기업 회원
- **사용자 페르소나**: 마케팅 담당자, 고객 관리 담당자
- **사용 시나리오**: 고객 주소록 관리, 그룹별 분류, 대량 등록

---

## 2. 기술 아키텍처

### 2.1 모듈 구조
```
AddressBookModule/
├── components/
│   ├── AddressBookPage.tsx          # 메인 페이지
│   ├── GroupList.tsx                # 그룹 목록
│   ├── GroupEditModal.tsx           # 그룹명 수정 모달
│   ├── GroupDeleteModal.tsx         # 그룹 삭제 모달
│   ├── AddressList.tsx              # 주소록 목록
│   ├── AddressForm.tsx              # 주소록 입력 폼
│   ├── ExcelUploadModal.tsx         # 엑셀 업로드 모달
│   └── AddressSelectModal.tsx       # 주소록 선택 모달
├── hooks/
│   ├── useAddressBook.ts            # 주소록 조회/관리
│   ├── useGroup.ts                  # 그룹 관리
│   └── useExcelUpload.ts            # 엑셀 업로드
├── services/
│   ├── addressBookService.ts        # 주소록 API
│   └── excelService.ts              # 엑셀 처리
├── types/
│   └── address.types.ts             # 주소록 타입
└── index.ts
```

### 2.2 기술 스택
- **프레임워크**: Next.js 14+, React 18+
- **상태관리**: TanStack Query, Zustand
- **스타일링**: Tailwind CSS, Shadcn/ui
- **엑셀 처리**: xlsx 라이브러리

---

## 3. 인터페이스 정의

### 3.1 외부 의존성
```typescript
interface ExternalDependencies {
  modules: [
    'FE-M008: AuthModule',
    'FE-M009: CommonUIModule',
  ];
  apis: [
    'BE-M004: AddressBookServiceModule',
  ];
  sharedComponents: ['Button', 'Input', 'Select', 'Modal', 'Table'];
  utils: [
    'COM-M001: APIClientModule',
    'COM-M002: DataModelsModule',
    'COM-M004: ValidationModule',
  ];
}
```

### 3.2 제공 인터페이스
```typescript
export interface AddressBookModuleInterface {
  components: {
    AddressBookPage: React.FC;
    AddressSelectModal: React.FC<AddressSelectModalProps>;
  };
  
  hooks: {
    useAddressBook: () => UseAddressBookReturn;
    useGroup: () => UseGroupReturn;
  };
  
  types: {
    Address: AddressEntity;
    Group: GroupEntity;
  };
}
```

---

## 4. 데이터 모델

### 4.1 엔티티 정의
```typescript
interface Address {
  id: string;
  userId: string;
  groupId: string;
  name: string;
  phoneNumber: string;
  memo?: string;
  isBlocked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface Group {
  id: string;
  userId: string;
  name: string;
  description?: string;
  addressCount: number;
  sortOrder: number;
  createdAt: Date;
}
```

---

## 5. 핵심 컴포넌트/서비스 명세

### 5.1 주요 컴포넌트

#### AddressBookPage
```typescript
const AddressBookPage: React.FC = () => {
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const { groups, loadGroups } = useGroup();
  const { addresses, loadAddresses, isLoading } = useAddressBook(selectedGroupId);
  
  return (
    <div className="flex h-screen">
      <aside className="w-64 border-r">
        <GroupList
          groups={groups}
          selectedGroupId={selectedGroupId}
          onSelect={setSelectedGroupId}
        />
      </aside>
      
      <main className="flex-1 p-6">
        <AddressList
          addresses={addresses}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </main>
    </div>
  );
};
```

---

## 6. 이벤트 및 메시징

### 6.1 발행 이벤트
```typescript
enum AddressBookEvents {
  ADDRESS_ADDED = 'addressbook.address.added',
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
  INVALID_PHONE_NUMBER = 'ADDR_001',
  DUPLICATE_PHONE_NUMBER = 'ADDR_002',
  GROUP_NOT_FOUND = 'ADDR_003',
  EXCEL_PARSE_ERROR = 'ADDR_004',
}
```

---

## 8. 테스트 전략

### 8.1 단위 테스트
- 컴포넌트 렌더링 테스트
- 훅 동작 테스트
- 엑셀 파싱 테스트

### 8.2 테스트 커버리지 목표
- **단위 테스트**: 80% 이상

---

## 9. 성능 최적화

### 9.1 최적화 기법
- 가상 스크롤링 (대량 데이터)
- 페이지네이션
- 엑셀 업로드 청크 처리

---

## 10. 보안 고려사항

### 10.1 데이터 보호
- 개인정보 마스킹 처리
- 본인 주소록만 접근 가능

---

**문서 버전**: 1.1  
**작성일**: 2024-11-19  
**최종 수정일**: 2024-11-19

## 변경 이력

### 버전 1.1 (2024-11-19)
- Address 엔티티에서 email 필드 제거
- 그룹 관리 기능 추가 (그룹명 수정, 그룹 삭제)
- 엑셀 샘플 파일 다운로드 기능 추가 (XLSX 형식)
- GroupEditModal, GroupDeleteModal 컴포넌트 추가

