# FE-M003: TemplateManageModule 상세 개발 설계서

## 1. 모듈 개요

### 1.1 모듈 식별 정보
- **모듈 ID**: FE-M003
- **모듈명**: TemplateManageModule (템플릿 관리 모듈)
- **담당 개발자**: Frontend 개발자
- **예상 개발 기간**: 12일
- **우선순위**: P1

### 1.2 모듈 목적 및 범위
- **핵심 기능**: 
  - 일반문자 템플릿 관리
  - 광고문자 템플릿 관리
  - 공직선거문자 템플릿 관리
  - 알림톡 템플릿 관리 (발신프로필별 관리, 카카오 검수 연동)
  - 브랜드톡 템플릿 관리 (발신프로필별 관리, 즉시 사용)
  - 템플릿 CRUD
  - 발신프로필 선택 및 관리 연동
  - 템플릿 검색/필터링/정렬
  - 템플릿 미리보기
  - 템플릿 복사
  - 080 수신거부 번호 관리 (광고문자/공직선거문자)
- **비즈니스 가치**: 재사용 가능한 메시지 템플릿 관리, 발신프로필별 템플릿 관리

---

## 2. 기술 아키텍처

### 2.1 모듈 구조
```
TemplateManageModule/
├── components/
│   ├── GeneralMessageTemplateList.tsx  # 일반문자 템플릿 목록
│   ├── GeneralMessageTemplateForm.tsx  # 일반문자 템플릿 등록/수정
│   ├── AdMessageTemplateList.tsx       # 광고문자 템플릿 목록
│   ├── AdMessageTemplateForm.tsx       # 광고문자 템플릿 등록/수정
│   ├── ElectionMessageTemplateList.tsx # 공직선거문자 템플릿 목록
│   ├── ElectionMessageTemplateForm.tsx # 공직선거문자 템플릿 등록/수정
│   ├── AlimtalkTemplateList.tsx       # 알림톡 템플릿 목록
│   ├── AlimtalkTemplateForm.tsx       # 알림톡 템플릿 등록/수정
│   ├── BrandtalkTemplateList.tsx      # 브랜드톡 템플릿 목록
│   ├── BrandtalkTemplateForm.tsx      # 브랜드톡 템플릿 등록/수정
│   ├── ProfileSelect.tsx              # 발신프로필 선택 (알림톡/브랜드톡)
│   ├── TemplatePreview.tsx            # 템플릿 미리보기
│   ├── TemplateSearchFilter.tsx       # 템플릿 검색/필터링
│   ├── RejectReasonModal.tsx          # 반려 사유 확인 (알림톡)
│   └── DeleteConfirmModal.tsx         # 삭제 확인 모달
├── hooks/
│   ├── useTemplate.ts                 # 템플릿 CRUD 훅
│   ├── useAlimtalkTemplate.ts         # 알림톡 템플릿 훅
│   ├── useBrandtalkTemplate.ts        # 브랜드톡 템플릿 훅
│   └── useProfileSelect.ts            # 발신프로필 선택 훅
├── services/
│   ├── templateService.ts             # 템플릿 API 호출
│   └── kakaoTemplateService.ts        # 카카오 템플릿 API 호출
├── types/
│   ├── template.types.ts              # 템플릿 타입
│   └── kakao-template.types.ts        # 카카오 템플릿 타입
└── utils/
    ├── templateValidator.ts           # 템플릿 검증
    └── templateFormatter.ts           # 템플릿 포맷팅
```

---

## 3. 인터페이스 정의

### 3.1 외부 의존성
```typescript
interface ExternalDependencies {
  modules: [
    'FE-M002: KakaoSendModule',        // 발신프로필 관리 연동
    'FE-M008: AuthModule',             // 인증 확인
    'FE-M009: CommonUIModule',         // 공통 UI 컴포넌트
  ];
  apis: [
    'BE-M002: KakaoServiceModule',     // 발신프로필 API
    'BE-M003: TemplateServiceModule',  // 템플릿 API
  ];
  sharedComponents: [
    'Button',
    'Input',
    'Select',
    'Modal',
    'Table',
    'FileUpload',
    'Toast',
  ];
  utils: [
    'COM-M001: APIClientModule',
    'COM-M002: DataModelsModule',
    'COM-M003: UtilsModule',
    'COM-M004: ValidationModule',
  ];
}
```

### 3.2 제공 인터페이스
```typescript
export interface TemplateManageModuleInterface {
  components: {
    AlimtalkTemplateList: React.FC<AlimtalkTemplateListProps>;
    AlimtalkTemplateForm: React.FC<AlimtalkTemplateFormProps>;
    BrandtalkTemplateList: React.FC<BrandtalkTemplateListProps>;
    BrandtalkTemplateForm: React.FC<BrandtalkTemplateFormProps>;
    ProfileSelect: React.FC<ProfileSelectProps>;
    TemplatePreview: React.FC<TemplatePreviewProps>;
  };
  
  hooks: {
    useAlimtalkTemplate: () => UseAlimtalkTemplateReturn;
    useBrandtalkTemplate: () => UseBrandtalkTemplateReturn;
    useProfileSelect: () => UseProfileSelectReturn;
  };
  
  types: {
    TemplateType: 'GENERAL_MESSAGE' | 'AD_MESSAGE' | 'ELECTION_MESSAGE' | 'ALIMTALK' | 'BRANDTALK';
    AlimtalkMessageType: 'BASIC' | 'HIGHLIGHT' | 'IMAGE';
    AlimtalkHighlightType: 'TEXT' | 'IMAGE' | 'ITEM_LIST';
    BrandtalkTemplateType: 'TEXT' | 'IMAGE' | 'WIDE_IMAGE' | 'WIDE_LIST' | 'CAROUSEL' | 'COMMERCE' | 'CARVAS';
    TemplateStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ACTIVE' | 'INACTIVE';
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
  };
}

// 알림톡 템플릿 등록
interface AlimtalkTemplateRegisterAPI {
  'POST /api/v1/templates/alimtalk': {
    request: AlimtalkTemplateRegisterRequestDTO;
    response: AlimtalkTemplateDTO;
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
  };
}

// 브랜드톡 템플릿 등록
interface BrandtalkTemplateRegisterAPI {
  'POST /api/v1/templates/brandtalk': {
    request: BrandtalkTemplateRegisterRequestDTO;
    response: BrandtalkTemplateDTO;
  };
}
```

---

## 4. 데이터 모델

### 4.1 엔티티 정의
```typescript
interface AlimtalkTemplate {
  id: string;
  profileId: string;
  templateCode: string;
  templateName: string;
  category: {
    main: string;
    sub: string;
  };
  messageType: 'BASIC' | 'HIGHLIGHT' | 'IMAGE';
  highlightType?: 'TEXT' | 'IMAGE' | 'ITEM_LIST';
  content: string;
  variables: string[];
  buttons: Button[];
  imageUrl?: string;
  quickReply?: QuickReply;
  isSecure: boolean;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectReason?: string;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface BrandtalkTemplate {
  id: string;
  profileId: string;
  templateCode: string;
  templateName: string;
  description?: string;
  templateType: 'TEXT' | 'IMAGE' | 'WIDE_IMAGE' | 'WIDE_LIST' | 'CAROUSEL' | 'COMMERCE' | 'CARVAS';
  content: string;
  images?: string[];
  buttons: Button[];
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: Date;
  updatedAt: Date;
}

interface Button {
  name: string;
  type: 'WEB_LINK' | 'APP_LINK' | 'CHANNEL_ADD' | 'MESSAGE_DELIVERY' | 'BOT_KEYWORD' | 'PHONE';
  url?: string;
  scheme?: string;
  keyword?: string;
  message?: string;
  phoneNumber?: string;
  order: number;
}

interface QuickReply {
  type: 'MESSAGE_DELIVERY' | 'BOT_KEYWORD';
  content: string;
}
```

### 4.2 상태 관리 스키마
```typescript
// Zustand Store
interface TemplateManageStore {
  // 발신프로필
  selectedProfileId: string | null;
  profiles: Profile[];
  
  // 알림톡 템플릿
  alimtalkTemplates: AlimtalkTemplate[];
  alimtalkFilters: {
    profileId?: string;
    status?: string;
    search?: string;
    category?: string;
    messageType?: string;
  };
  
  // 브랜드톡 템플릿
  brandtalkTemplates: BrandtalkTemplate[];
  brandtalkFilters: {
    profileId?: string;
    status?: string;
    templateType?: string;
    search?: string;
  };
  
  // 액션
  setSelectedProfile: (profileId: string) => void;
  setAlimtalkFilters: (filters: Partial<AlimtalkFilters>) => void;
  setBrandtalkFilters: (filters: Partial<BrandtalkFilters>) => void;
}
```

---

## 5. 핵심 컴포넌트/서비스 명세

### 5.1 주요 컴포넌트

#### ProfileSelect
```typescript
interface ProfileSelectProps {
  templateType: 'ALIMTALK' | 'BRANDTALK';
  selectedProfileId?: string;
  onProfileChange: (profileId: string) => void;
}

const ProfileSelect: React.FC<ProfileSelectProps> = ({
  templateType,
  selectedProfileId,
  onProfileChange,
}) => {
  const { profiles, isLoading } = useProfileList();
  const router = useRouter();
  
  const handleGoToProfileManage = () => {
    router.push('/kakao/profile/manage');
  };
  
  return (
    <div className="flex items-center gap-4 mb-6">
      <div className="flex-1">
        <label className="block text-sm font-medium mb-2">발신프로필</label>
        <Select
          value={selectedProfileId || ''}
          onChange={(e) => onProfileChange(e.target.value)}
          disabled={isLoading}
        >
          <option value="">선택해주세요</option>
          {profiles.map(profile => (
            <option key={profile.id} value={profile.id}>
              {profile.profileId} ({profile.channelName}) - {profile.status}
            </option>
          ))}
        </Select>
      </div>
      <Button
        onClick={handleGoToProfileManage}
        variant="outline"
        className="mt-6"
      >
        발신프로필 등록
      </Button>
    </div>
  );
};
```

#### AlimtalkTemplateList
```typescript
const AlimtalkTemplateList: React.FC = () => {
  const store = useTemplateManageStore();
  const { templates, isLoading, loadTemplates } = useAlimtalkTemplate();
  const router = useRouter();
  
  useEffect(() => {
    if (store.selectedProfileId) {
      loadTemplates({
        profileId: store.selectedProfileId,
        ...store.alimtalkFilters,
      });
    }
  }, [store.selectedProfileId, store.alimtalkFilters]);
  
  const handleRegister = () => {
    router.push('/template/kakao/alimtalk/register');
  };
  
  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">알림톡 템플릿 관리</h1>
        <Button onClick={handleRegister}>템플릿 등록</Button>
      </div>
      
      <ProfileSelect
        templateType="ALIMTALK"
        selectedProfileId={store.selectedProfileId || undefined}
        onProfileChange={(profileId) => store.setSelectedProfile(profileId)}
      />
      
      <TemplateSearchFilter
        type="ALIMTALK"
        filters={store.alimtalkFilters}
        onFilterChange={(filters) => store.setAlimtalkFilters(filters)}
      />
      
      {isLoading ? (
        <LoadingSpinner />
      ) : templates.length === 0 ? (
        <EmptyState
          message="등록된 템플릿이 없습니다"
          actionLabel="템플릿 등록하기"
          onAction={handleRegister}
        />
      ) : (
        <TemplateTable
          templates={templates}
          onEdit={(id) => router.push(`/template/kakao/alimtalk/edit/${id}`)}
          onDelete={(id) => handleDelete(id)}
          onPreview={(id) => handlePreview(id)}
          onCopy={(id) => handleCopy(id)}
        />
      )}
    </div>
  );
};
```

#### BrandtalkTemplateList
```typescript
const BrandtalkTemplateList: React.FC = () => {
  const store = useTemplateManageStore();
  const { templates, isLoading, loadTemplates } = useBrandtalkTemplate();
  const router = useRouter();
  
  useEffect(() => {
    if (store.selectedProfileId) {
      loadTemplates({
        profileId: store.selectedProfileId,
        ...store.brandtalkFilters,
      });
    }
  }, [store.selectedProfileId, store.brandtalkFilters]);
  
  const handleRegister = () => {
    router.push('/template/kakao/brandtalk/register');
  };
  
  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">브랜드톡 템플릿 관리</h1>
        <Button onClick={handleRegister}>브랜드 메시지 등록</Button>
      </div>
      
      <ProfileSelect
        templateType="BRANDTALK"
        selectedProfileId={store.selectedProfileId || undefined}
        onProfileChange={(profileId) => store.setSelectedProfile(profileId)}
      />
      
      <TemplateSearchFilter
        type="BRANDTALK"
        filters={store.brandtalkFilters}
        onFilterChange={(filters) => store.setBrandtalkFilters(filters)}
      />
      
      {isLoading ? (
        <LoadingSpinner />
      ) : templates.length === 0 ? (
        <EmptyState
          message="등록된 브랜드톡 템플릿이 없습니다"
          actionLabel="브랜드 메시지 등록"
          onAction={handleRegister}
        />
      ) : (
        <TemplateTable
          templates={templates}
          onEdit={(id) => router.push(`/template/kakao/brandtalk/edit/${id}`)}
          onDelete={(id) => handleDelete(id)}
          onPreview={(id) => handlePreview(id)}
          onCopy={(id) => handleCopy(id)}
        />
      )}
    </div>
  );
};
```

### 5.2 Custom Hooks

#### useProfileSelect
```typescript
export function useProfileSelect() {
  const queryClient = useQueryClient();
  
  const profileListQuery = useQuery({
    queryKey: ['profiles'],
    queryFn: () => profileService.getProfiles(),
  });
  
  return {
    profiles: profileListQuery.data?.profiles || [],
    isLoading: profileListQuery.isLoading,
  };
}
```

#### useAlimtalkTemplate
```typescript
export function useAlimtalkTemplate() {
  const queryClient = useQueryClient();
  
  const templateListQuery = useQuery({
    queryKey: ['alimtalk-templates', filters],
    queryFn: () => templateService.getAlimtalkTemplates(filters),
    enabled: !!filters.profileId,
  });
  
  const registerMutation = useMutation({
    mutationFn: (data: AlimtalkTemplateRegisterRequest) =>
      templateService.registerAlimtalkTemplate(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['alimtalk-templates']);
    },
  });
  
  return {
    templates: templateListQuery.data?.templates || [],
    isLoading: templateListQuery.isLoading,
    loadTemplates: (filters: AlimtalkTemplateFilters) => {
      // 필터 업데이트 및 쿼리 재실행
    },
    registerTemplate: registerMutation.mutateAsync,
    updateTemplate: updateMutation.mutateAsync,
    deleteTemplate: deleteMutation.mutateAsync,
  };
}
```

#### useBrandtalkTemplate
```typescript
export function useBrandtalkTemplate() {
  const queryClient = useQueryClient();
  
  const templateListQuery = useQuery({
    queryKey: ['brandtalk-templates', filters],
    queryFn: () => templateService.getBrandtalkTemplates(filters),
    enabled: !!filters.profileId,
  });
  
  const registerMutation = useMutation({
    mutationFn: (data: BrandtalkTemplateRegisterRequest) =>
      templateService.registerBrandtalkTemplate(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['brandtalk-templates']);
    },
  });
  
  return {
    templates: templateListQuery.data?.templates || [],
    isLoading: templateListQuery.isLoading,
    loadTemplates: (filters: BrandtalkTemplateFilters) => {
      // 필터 업데이트 및 쿼리 재실행
    },
    registerTemplate: registerMutation.mutateAsync,
    updateTemplate: updateMutation.mutateAsync,
    deleteTemplate: deleteMutation.mutateAsync,
  };
}
```

---

## 6. 에러 처리

### 6.1 에러 코드 정의
```typescript
enum TemplateManageErrorCode {
  PROFILE_NOT_SELECTED = 'TPL_001',
  TEMPLATE_CODE_DUPLICATE = 'TPL_002',
  TEMPLATE_NOT_FOUND = 'TPL_003',
  INVALID_TEMPLATE_FORMAT = 'TPL_004',
  KAKAO_API_ERROR = 'TPL_005',
  IMAGE_UPLOAD_FAILED = 'TPL_006',
}
```

### 6.2 에러 처리 전략
- 발신프로필 미선택: 발신프로필 선택 안내
- 템플릿 코드 중복: 다른 코드 입력 유도
- 카카오 API 오류: 재시도 옵션 제공
- 이미지 업로드 실패: 재업로드 안내

---

## 7. 테스트 전략

### 7.1 단위 테스트
- 템플릿 검증 로직 테스트
- 발신프로필 선택 컴포넌트 테스트
- 템플릿 목록 조회 테스트

### 7.2 통합 테스트
- 템플릿 등록 플로우 테스트
- 발신프로필별 템플릿 조회 테스트
- 템플릿 수정/삭제 플로우 테스트

---

**문서 버전**: 2.1  
**작성일**: 2024-11-19  
**최종 수정일**: 2024-11-19

## 변경 이력

### 버전 2.1 (2024-11-19)
- **템플릿 메뉴 구조 변경**: "문자" → "일반문자", "광고문자", "공직선거문자" 메뉴 추가
- **광고문자 템플릿 페이지**: 광고문자 전용 템플릿 관리 페이지 추가
  - (광고) 옆 문구 입력 필드
  - 080 수신거부 번호 셀렉박스
  - 변수 버튼: 이름, 전화번호, 변수1, 변수2, 변수3
  - MMS 이미지 최대 3개 개별 추가
- **공직선거문자 템플릿 페이지**: 공직선거문자 전용 템플릿 관리 페이지 추가
  - 후보자/정당명 입력 필드
  - 080 수신거부 번호 셀렉박스
  - 변수 버튼: 이름, 전화번호, 변수1, 변수2, 변수3
  - 금지어 검사 기능
  - MMS 이미지 최대 3개 개별 추가
- **일반문자 템플릿**: 변수 버튼에 변수1, 변수2, 변수3 추가
- **탭 메뉴**: 알림톡/브랜드톡 탭 클릭 시에도 일반문자/광고문자/공직선거문자 탭 유지

### 버전 2.0 (2024-11-19)

