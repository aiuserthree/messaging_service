# FE-M002: KakaoSendModule 상세 개발 설계서

## 1. 모듈 개요

### 1.1 모듈 식별 정보
- **모듈 ID**: FE-M002
- **모듈명**: KakaoSendModule (카카오톡 발송 모듈)
- **담당 개발자**: Frontend 개발자
- **예상 개발 기간**: 15일
- **우선순위**: P0

### 1.2 모듈 목적 및 범위
- **핵심 기능**: 
  - 발신프로필 관리 (등록, 목록, 상세, 수정, 삭제)
  - 알림톡 발송 (템플릿 존재 여부 페이지 진입 시 최우선 확인)
  - 브랜드톡 발송 (템플릿 존재 여부 페이지 진입 시 최우선 확인, 발송 시간 제한)
  - 템플릿 선택 및 검증
  - 변수 입력 및 치환
  - 대체 메시지 설정
  - 엑셀 업로드 (변수 치환 지원)
  - 실시간 미리보기
  - 발송 시간 제한 검증 (브랜드톡: 평일 08:00~21:00)
- **비즈니스 가치**: 카카오톡을 통한 메시지 발송 기능 제공, 템플릿 부재 시 명확한 안내 및 등록 유도, 발신프로필 관리
- **제외 범위**: 템플릿 관리 (FE-M003), 발송 결과 조회 (FE-M005)

### 1.3 목표 사용자
- **주 사용자 그룹**: 개인/기업 회원
- **사용자 페르소나**: 마케팅 담당자, 고객 서비스 담당자
- **사용 시나리오**: 주문/배송 알림, 마케팅 메시지 발송

---

## 2. 기술 아키텍처

### 2.1 모듈 구조
```
KakaoSendModule/
├── components/
│   ├── KakaoSendPage.tsx              # 메인 페이지
│   ├── ProfileManagePage.tsx          # 발신프로필 관리 페이지
│   ├── ProfileList.tsx                # 발신프로필 목록
│   ├── ProfileRegisterModal.tsx       # 발신프로필 등록 모달
│   ├── ProfileDetailModal.tsx         # 발신프로필 상세 모달
│   ├── AlimtalkSend.tsx               # 알림톡 발송
│   ├── BrandtalkSend.tsx              # 브랜드톡 발송
│   ├── TemplateCheckAlert.tsx         # 템플릿 부재 안내
│   ├── ChannelSelect.tsx              # 채널/프로필 선택
│   ├── TemplateSelectModal.tsx        # 템플릿 선택 모달
│   ├── VariableInput.tsx              # 변수 입력
│   ├── RecipientInput.tsx             # 수신번호 입력
│   ├── ExcelUploadModal.tsx           # 엑셀 업로드 모달
│   ├── MessagePreview.tsx             # 메시지 미리보기
│   ├── AlternativeMessageInput.tsx    # 대체 메시지 입력
│   ├── SendTimeSetting.tsx            # 발송 시간 설정 (브랜드톡)
│   └── AdMessageNotice.tsx            # 광고성 메시지 안내 (브랜드톡)
├── hooks/
│   ├── useKakaoSend.ts                # 발송 로직 훅
│   ├── useTemplateCheck.ts            # 템플릿 존재 여부 확인
│   ├── useVariableInput.ts            # 변수 입력 훅
│   ├── useExcelUpload.ts              # 엑셀 업로드 훅
│   ├── useProfileManage.ts            # 발신프로필 관리 훅
│   └── useSendTimeValidation.ts       # 발송 시간 검증 훅 (브랜드톡)
├── services/
│   ├── kakaoService.ts                # 발송 API 호출
│   ├── templateService.ts             # 템플릿 조회
│   ├── excelService.ts                # 엑셀 파싱
│   └── profileService.ts              # 발신프로필 API 호출
├── types/
│   ├── kakao.types.ts                 # 카카오톡 타입
│   └── template.types.ts              # 템플릿 타입
├── utils/
│   ├── templateValidator.ts           # 템플릿 검증
│   └── variableReplacer.ts            # 변수 치환
├── tests/
│   ├── KakaoSendPage.test.tsx
│   └── components.test.tsx
└── index.ts
```

### 2.2 기술 스택
- **프레임워크**: Next.js 14+ (App Router)
- **UI 라이브러리**: React 18+
- **상태관리**: TanStack Query, Zustand
- **스타일링**: Tailwind CSS, Shadcn/ui
- **폼 관리**: React Hook Form, Zod
- **엑셀 처리**: xlsx 라이브러리
- **테스트**: Jest, React Testing Library

---

## 3. 인터페이스 정의

### 3.1 외부 의존성
```typescript
interface ExternalDependencies {
  modules: [
    'FE-M003: TemplateManageModule',   // 템플릿 조회, 템플릿 관리 페이지 이동
    'FE-M004: AddressBookModule',      // 주소록 선택
    'FE-M008: AuthModule',             // 인증 확인
    'FE-M009: CommonUIModule',         // 공통 UI 컴포넌트
  ];
  apis: [
    'BE-M002: KakaoServiceModule',     // 발송 API
    'BE-M003: TemplateServiceModule',  // 템플릿 API
    'BE-M004: AddressBookServiceModule', // 주소록 API
  ];
  sharedComponents: [
    'Button',
    'Input',
    'Select',
    'Modal',
    'Toast',
    'FileUpload',
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
export interface KakaoSendModuleInterface {
  components: {
    KakaoSendPage: React.FC<KakaoSendPageProps>;
    ProfileManagePage: React.FC<ProfileManagePageProps>;
    AlimtalkSend: React.FC<AlimtalkSendProps>;
    BrandtalkSend: React.FC<BrandtalkSendProps>;
    TemplateCheckAlert: React.FC<TemplateCheckAlertProps>;
  };
  
  hooks: {
    useKakaoSend: () => UseKakaoSendReturn;
    useTemplateCheck: () => UseTemplateCheckReturn;
    useVariableInput: () => UseVariableInputReturn;
    useProfileManage: () => UseProfileManageReturn;
    useSendTimeValidation: () => UseSendTimeValidationReturn;
  };
  
  types: {
    SendType: 'ALIMTALK' | 'BRANDTALK';
    TemplateType: 'BASIC' | 'HIGHLIGHT' | 'IMAGE' | 'WIDE' | 'CAROUSEL';
    TemplateStatus: 'APPROVED' | 'PENDING' | 'REJECTED' | 'ACTIVE' | 'INACTIVE';
    ProfileStatus: 'REGISTERED' | 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'BLOCKED';
  };
}
```

### 3.3 API 명세
```typescript
// 발신프로필 목록 조회 API
interface ProfileListAPI {
  'GET /api/v1/kakao/profiles': {
    request: {
      status?: 'REGISTERED' | 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'BLOCKED';
      search?: string;
    };
    response: {
      profiles: Profile[];
      total: number;
    };
  };
}

// 담당자 휴대폰 번호 인증요청 API
interface PhoneVerificationAPI {
  'POST /api/v1/kakao/profiles/verify-phone': {
    request: {
      profileId: string; // @아이디 형태
      phoneNumber: string; // 숫자만 (10-11자리)
    };
    response: {
      verified: boolean;
      message: string;
    };
    errors: ['PROFILE_NOT_FOUND', 'PHONE_MISMATCH', 'INVALID_PHONE_NUMBER'];
  };
}

// 발신프로필 등록 API
interface ProfileRegisterAPI {
  'POST /api/v1/kakao/profiles': {
    request: {
      profileId: string; // @아이디 형태
      phoneNumber?: string;
      categories: string[]; // 최대 3개
    };
    response: {
      profileId: string;
      status: string;
    };
  };
}

// 템플릿 존재 여부 확인 API
interface TemplateCheckAPI {
  'GET /api/v1/kakao/templates/check': {
    request: {
      channelId: string;
      sendType: 'ALIMTALK' | 'BRANDTALK';
    };
    response: {
      hasTemplate: boolean;
      templateCount: number;
      message?: string;
    };
  };
}

// 알림톡 발송 API
interface AlimtalkSendAPI {
  'POST /api/v1/kakao/alimtalk/send': {
    request: {
      channelId: string;
      templateId: string;
      variables: Record<string, string>;
      recipientNumbers: string[];
      alternativeMessage: string;
      sendMode: 'IMMEDIATE' | 'SCHEDULED';
      scheduledAt?: string;
    };
    response: {
      sendId: string;
      totalCount: number;
      successCount: number;
      failCount: number;
      estimatedCost: number;
    };
    errors: [
      'NO_TEMPLATE',
      'TEMPLATE_NOT_APPROVED',
      'MISSING_REQUIRED_VARIABLE',
      'INVALID_PHONE_NUMBER',
      'INSUFFICIENT_BALANCE',
    ];
  };
}

// 브랜드톡 발송 API
interface BrandtalkSendAPI {
  'POST /api/v1/kakao/brandtalk/send': {
    request: {
      channelId: string;
      templateId: string;
      variables?: Record<string, string>;
      images?: string[];
      recipientNumbers: string[];
      alternativeMessage?: string;
      sendMode: 'IMMEDIATE' | 'SCHEDULED';
      scheduledAt?: string;
    };
    response: {
      sendId: string;
      totalCount: number;
      successCount: number;
      failCount: number;
      estimatedCost: number;
    };
    errors: [
      'NO_TEMPLATE',
      'TEMPLATE_INACTIVE',
      'INVALID_TEMPLATE_TYPE',
      'INVALID_PHONE_NUMBER',
      'INSUFFICIENT_BALANCE',
    ];
  };
}
```

---

## 4. 데이터 모델

### 4.1 엔티티 정의
```typescript
interface KakaoSendForm {
  sendType: 'ALIMTALK' | 'BRANDTALK';
  channelId: string;
  templateId: string;
  variables: Record<string, string>;
  recipientNumbers: string[];
  alternativeMessage?: string;
  sendMode: 'IMMEDIATE' | 'SCHEDULED';
  scheduledAt?: Date;
}

interface Profile {
  id: string;
  profileId: string; // @아이디 형태
  channelName: string;
  status: 'REGISTERED' | 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'BLOCKED';
  brandMessageEnabled: boolean;
  bottomLinkNumber?: string;
  categories: string[];
  registeredAt: Date;
  templateCount?: number;
}

interface Channel {
  id: string;
  name: string;
  type: 'ALIMTALK' | 'BRANDTALK';
  status: 'ACTIVE' | 'INACTIVE';
  hasTemplate: boolean;
  templateCount: number;
}

interface AlimtalkTemplate {
  id: string;
  code: string;
  name: string;
  category: string;
  content: string;
  variables: string[];
  buttons: Button[];
  hasImage: boolean;
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
  approvedAt?: Date;
  preview?: string;
}

interface BrandtalkTemplate {
  id: string;
  code: string;
  name: string;
  type: 'BASIC' | 'HIGHLIGHT' | 'IMAGE' | 'WIDE' | 'CAROUSEL';
  content: string;
  variables?: string[];
  buttons: Button[];
  images?: string[];
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: Date;
  preview?: string;
}

interface Button {
  name: string;
  type: 'WEB_LINK' | 'APP_LINK' | 'DELIVERY' | 'BOT_KEYWORD' | 'PHONE';
  url?: string;
  keyword?: string;
  phoneNumber?: string;
}
```

### 4.2 상태 관리 스키마
```typescript
// Zustand Store
interface KakaoSendStore {
  // 발송 타입
  sendType: 'ALIMTALK' | 'BRANDTALK';
  
  // 채널/프로필
  selectedChannelId: string | null;
  channels: Channel[];
  profiles: Profile[];
  
  // 템플릿
  selectedTemplateId: string | null;
  templates: (AlimtalkTemplate | BrandtalkTemplate)[];
  hasTemplate: boolean;
  templateCheckLoading: boolean;
  
  // 변수
  variables: Record<string, string>;
  
  // 수신번호
  recipientNumbers: string[];
  
  // 대체 메시지
  alternativeMessage: string;
  
  // 발송 설정
  sendMode: 'IMMEDIATE' | 'SCHEDULED';
  scheduledAt?: Date;
  
  // 브랜드톡 발송 시간 제한
  sendTimeRestriction: {
    enabled: boolean; // 브랜드톡만 true
    allowedHours: { start: number; end: number }; // 8, 21
    allowedDays: number[]; // 1-5 (월-금)
  };
  
  // 계산된 값
  estimatedCost: number;
  recipientCount: number;
  
  // 액션
  setSendType: (type: 'ALIMTALK' | 'BRANDTALK') => void;
  setChannel: (channelId: string) => void;
  checkTemplate: (channelId: string) => Promise<void>;
  setTemplate: (templateId: string) => void;
  setVariables: (variables: Record<string, string>) => void;
  setRecipientNumbers: (numbers: string[]) => void;
  setScheduledAt: (date?: Date) => void;
  validateSendTime: (date: Date) => boolean;
  resetForm: () => void;
}
```

---

## 5. 핵심 컴포넌트/서비스 명세

### 5.1 주요 컴포넌트

#### KakaoSendPage
```typescript
interface KakaoSendPageProps {
  sendType?: 'ALIMTALK' | 'BRANDTALK';
}

const KakaoSendPage: React.FC<KakaoSendPageProps> = ({ sendType = 'ALIMTALK' }) => {
  const { user } = useAuth();
  const sendStore = useKakaoSendStore();
  const { checkTemplate, hasTemplate, isLoading } = useTemplateCheck();
  
  useEffect(() => {
    sendStore.setSendType(sendType);
    // 채널 목록 로드
    loadChannels();
  }, [sendType]);
  
  useEffect(() => {
    // 채널 선택 시 템플릿 확인
    if (sendStore.selectedChannelId) {
      checkTemplate(sendStore.selectedChannelId);
    }
  }, [sendStore.selectedChannelId]);
  
  // 템플릿이 없으면 안내 화면 표시
  if (!hasTemplate && !isLoading) {
    return <TemplateCheckAlert sendType={sendType} />;
  }
  
  return (
    <div className="container mx-auto p-6">
      <PageHeader title={sendType === 'ALIMTALK' ? '알림톡 발송' : '브랜드톡 발송'} />
      
      {sendType === 'ALIMTALK' && <AlimtalkSend />}
      {sendType === 'BRANDTALK' && <BrandtalkSend />}
    </div>
  );
};
```

#### ProfileManagePage
```typescript
interface ProfileManagePageProps {}

const ProfileManagePage: React.FC<ProfileManagePageProps> = () => {
  const { profiles, isLoading, registerProfile, updateProfile, deleteProfile } = useProfileManage();
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [filters, setFilters] = useState<ProfileFilters>({});
  
  const handleViewDetail = (profile: Profile) => {
    setSelectedProfile(profile);
    setIsDetailModalOpen(true);
  };
  
  const handleRegister = async (data: ProfileRegisterRequest) => {
    try {
      await registerProfile(data);
      setIsRegisterModalOpen(false);
      toast.success('발신프로필이 등록되었습니다.');
    } catch (error) {
      toast.error('발신프로필 등록에 실패했습니다.');
    }
  };
  
  const handleDelete = async (profileId: string) => {
    if (!confirm('발신프로필을 삭제하시겠습니까?')) return;
    
    try {
      await deleteProfile(profileId);
      setIsDetailModalOpen(false);
      toast.success('발신프로필이 삭제되었습니다.');
    } catch (error) {
      toast.error('발신프로필 삭제에 실패했습니다.');
    }
  };
  
  return (
    <div className="container mx-auto p-6">
      <PageHeader 
        title="발신프로필 관리"
        description="카카오톡 채널(발신프로필)을 등록하고 관리합니다"
        action={
          <Button onClick={() => setIsRegisterModalOpen(true)}>
            신규 등록
          </Button>
        }
      />
      
      {/* 안내 영역 */}
      <Alert variant="info" className="mb-6">
        <div>
          <strong>💡 카카오톡 채널(<a href="https://center-pf.kakao.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">https://center-pf.kakao.com</a>)에서 비즈니스 채널로 등록된 카카오톡 채널(발신프로필)만 등록 가능합니다.</strong>
        </div>
      </Alert>
      
      {/* 검색 및 필터 */}
      <Card className="mb-6">
        <div className="flex gap-4">
          <Input
            placeholder="발신프로필 ID 또는 채널명으로 검색"
            value={filters.search || ''}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="flex-1"
          />
          <Select
            value={filters.status || ''}
            onChange={(value) => setFilters({ ...filters, status: value as ProfileStatus })}
            placeholder="전체 상태"
          >
            <option value="">전체 상태</option>
            <option value="REGISTERED">등록</option>
            <option value="PENDING">검수중</option>
            <option value="ACTIVE">활성</option>
            <option value="SUSPENDED">중단</option>
            <option value="BLOCKED">차단</option>
          </Select>
          <Button onClick={() => {/* 검색 로직 */}}>검색</Button>
          <Button variant="outline" onClick={() => setFilters({})}>초기화</Button>
        </div>
      </Card>
      
      {/* 발신프로필 목록 */}
      <Card>
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>NO</TableHead>
                <TableHead>발신프로필 ID</TableHead>
                <TableHead>카카오톡 채널명</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>브랜드메시지</TableHead>
                <TableHead>등록일</TableHead>
                <TableHead>관리</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {profiles.map((profile, index) => (
                <TableRow key={profile.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{profile.profileId}</TableCell>
                  <TableCell>{profile.channelName}</TableCell>
                  <TableCell>
                    <StatusBadge status={profile.status} />
                  </TableCell>
                  <TableCell>{profile.brandMessageEnabled ? 'Y' : 'N'}</TableCell>
                  <TableCell>{formatDate(profile.registeredAt)}</TableCell>
                  <TableCell>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewDetail(profile)}
                    >
                      상세
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
      
      {/* 등록 모달 */}
      <ProfileRegisterModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onRegister={handleRegister}
      />
      
      {/* 상세 모달 */}
      {selectedProfile && (
        <ProfileDetailModal
          isOpen={isDetailModalOpen}
          profile={selectedProfile}
          onClose={() => setIsDetailModalOpen(false)}
          onUpdate={updateProfile}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};
```

#### ProfileRegisterModal
```typescript
interface ProfileRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegister: (data: ProfileRegisterRequest) => Promise<void>;
}

const ProfileRegisterModal: React.FC<ProfileRegisterModalProps> = ({
  isOpen,
  onClose,
  onRegister,
}) => {
  const { register, handleSubmit, formState: { errors }, watch, setError, clearErrors } = useForm<ProfileRegisterRequest>();
  const [isVerified, setIsVerified] = useState(false);
  const phoneNumber = watch('phoneNumber');
  
  const handleVerificationRequest = async () => {
    const profileId = watch('profileId');
    const phone = phoneNumber?.replace(/[^0-9]/g, '');
    
    if (!profileId) {
      setError('profileId', { message: '발신프로필 ID를 먼저 입력해주세요.' });
      return;
    }
    
    if (!phone || phone.length < 10 || phone.length > 11) {
      setError('phoneNumber', { message: '올바른 휴대폰 번호를 입력해주세요.' });
      return;
    }
    
    try {
      const response = await apiClient.post<{ verified: boolean; message: string }>(
        '/api/v1/kakao/profiles/verify-phone',
        { profileId, phoneNumber: phone }
      );
      
      if (response.data.verified) {
        setIsVerified(true);
        clearErrors('phoneNumber');
        toast.success('인증되었습니다.');
      } else {
        setIsVerified(false);
        setError('phoneNumber', { message: response.data.message || '발신프로필과 휴대폰 번호가 일치하지 않습니다.' });
      }
    } catch (error) {
      setIsVerified(false);
      setError('phoneNumber', { message: '인증 요청에 실패했습니다.' });
    }
  };
  
  const onSubmit = async (data: ProfileRegisterRequest) => {
    await onRegister(data);
  };
  
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <Modal.Header>
        <h2>발신프로필 등록</h2>
      </Modal.Header>
      
      <Modal.Body>
        <Alert variant="info" className="mb-6">
          <strong>💡 카카오톡 채널(<a href="https://center-pf.kakao.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">https://center-pf.kakao.com</a>)에서 비즈니스 채널로 등록된 카카오톡 채널(발신프로필)만 등록 가능합니다.</strong>
        </Alert>
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <FormField
            label="발신프로필 *"
            error={errors.profileId?.message}
          >
            <Input
              {...register('profileId', {
                required: '발신프로필 ID를 입력해주세요',
                pattern: {
                  value: /^@[a-zA-Z0-9_]+$/,
                  message: '발신프로필 ID는 @로 시작하고 영문/숫자/언더스코어만 허용됩니다',
                },
              })}
              placeholder="@"
            />
            <FormHelperText>
              카카오톡 채널 관리자(마스터 또는 매니저) 휴대폰번호를 입력해주세요.
            </FormHelperText>
          </FormField>
          
          <FormField
            label="담당자 휴대폰 번호"
            error={errors.phoneNumber?.message}
          >
            <div className="flex gap-2">
              <Input
                {...register('phoneNumber', {
                  pattern: {
                    value: /^[0-9]{10,11}$/,
                    message: '올바른 휴대폰 번호를 입력해주세요 (10-11자리 숫자)',
                  },
                })}
                placeholder="- 없이 숫자만 입력해주세요"
                className="flex-1"
              />
              <Button
                type="button"
                onClick={handleVerificationRequest}
                variant="outline"
              >
                인증요청
              </Button>
            </div>
            <FormHelperText>
              {isVerified ? (
                <span className="text-green-600">✓ 인증되었습니다</span>
              ) : (
                '카카오톡 채널 관리자(마스터 또는 매니저) 휴대폰번호를 입력해주세요.'
              )}
            </FormHelperText>
          </FormField>
          
          <FormField
            label="카테고리 *"
            error={errors.categories?.message}
          >
            <CategorySelect
              {...register('categories', {
                required: '카테고리를 최소 1개 이상 선택해주세요',
                validate: (value) => {
                  if (value.length > 3) return '카테고리는 최대 3개까지 선택할 수 있습니다';
                  if (new Set(value).size !== value.length) return '중복된 카테고리를 선택할 수 없습니다';
                  return true;
                },
              })}
              maxSelections={3}
            />
            <FormHelperText>
              카카오톡 채널 관리자센터에서 발신프로필별 최초 생성 시 선택했던 카테고리와 동일하게 선택해주세요
            </FormHelperText>
            <Alert variant="warning" className="mt-2">
              ⚠️ 단, 등록된 카테고리가 잘못된 경우 카테고리로 전환
            </Alert>
          </FormField>
        </form>
      </Modal.Body>
      
      <Modal.Footer>
        <Button variant="outline" onClick={onClose}>취소</Button>
        <Button onClick={handleSubmit(onSubmit)}>등록</Button>
      </Modal.Footer>
    </Modal>
  );
};
```

#### ProfileDetailModal
```typescript
interface ProfileDetailModalProps {
  isOpen: boolean;
  profile: Profile;
  onClose: () => void;
  onUpdate: (id: string, data: ProfileUpdateRequest) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const ProfileDetailModal: React.FC<ProfileDetailModalProps> = ({
  isOpen,
  profile,
  onClose,
  onUpdate,
  onDelete,
}) => {
  const canEdit = profile.status === 'ACTIVE';
  const canDelete = (profile.templateCount || 0) === 0;
  
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <Modal.Header>
        <h2>발신프로필 상세</h2>
      </Modal.Header>
      
      <Modal.Body>
        {/* 기본 정보 */}
        <Section title="기본 정보">
          <InfoRow label="발신프로필 ID" value={profile.profileId} />
          <InfoRow label="카카오톡 채널명" value={profile.channelName} />
          <InfoRow label="등록일" value={formatDate(profile.registeredAt)} />
          <InfoRow 
            label="상태" 
            value={<StatusBadge status={profile.status} />} 
          />
          <InfoRow 
            label="브랜드메시지 사용여부" 
            value={profile.brandMessageEnabled ? 'Y' : 'N'} 
          />
        </Section>
        
        {/* 담당자 휴대폰 번호 */}
        <Section title="담당자 휴대폰 번호">
          <div>{profile.phoneNumber || '등록된 정보가 없습니다.'}</div>
        </Section>
        
        {/* 카테고리 */}
        <Section title="카테고리">
          <div className="flex gap-2 flex-wrap">
            {profile.categories.map((category) => (
              <Badge key={category}>{category}</Badge>
            ))}
          </div>
        </Section>
        
        {/* 등록 이력 */}
        <Section title="등록 이력">
          <div className="space-y-2">
            <div>등록일시: {formatDateTime(profile.registeredAt)}</div>
            <div>등록자: {profile.registeredBy}</div>
            {/* 상태 변경 이력 표시 */}
          </div>
        </Section>
        
        {/* 관련 템플릿 */}
        <Section title="관련 템플릿">
          <div className="flex items-center justify-between">
            <div>등록된 템플릿: {profile.templateCount || 0}개</div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.location.href = '/kakao/template/alimtalk'}
            >
              템플릿 관리
            </Button>
          </div>
        </Section>
      </Modal.Body>
      
      <Modal.Footer>
        {canEdit && (
          <Button variant="outline" onClick={() => {/* 수정 로직 */}}>
            수정
          </Button>
        )}
        {canDelete && (
          <Button variant="danger" onClick={() => onDelete(profile.id)}>
            삭제
          </Button>
        )}
        <Button variant="outline" onClick={onClose}>닫기</Button>
      </Modal.Footer>
    </Modal>
  );
};
```

#### TemplateCheckAlert
```typescript
interface TemplateCheckAlertProps {
  sendType: 'ALIMTALK' | 'BRANDTALK';
}

const TemplateCheckAlert: React.FC<TemplateCheckAlertProps> = ({ sendType }) => {
  const router = useRouter();
  
  const handleGoToTemplate = () => {
    const url = sendType === 'ALIMTALK' 
      ? '/kakao/template/alimtalk'
      : '/kakao/template/brandtalk';
    window.open(url, '_blank');
  };
  
  const handleGoToGuide = () => {
    // 카카오비즈니스 알림톡 유형 가이드 페이지로 새창 이동
    window.open('https://kakaobusiness.gitbook.io/main/ad/infotalk/content-guide', '_blank');
  };
  
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-4">
          {sendType === 'ALIMTALK' ? '📋' : '💬'}
        </div>
        
        <h2 className="text-2xl font-bold mb-4">
          {sendType === 'ALIMTALK' 
            ? '등록된 알림톡 템플릿이 없습니다'
            : '등록된 브랜드톡 템플릿이 없습니다'}
        </h2>
        
        <div className="text-gray-600 mb-6 space-y-2">
          {sendType === 'ALIMTALK' ? (
            <>
              <p>알림톡 발송을 위해서는 카카오톡 채널에서</p>
              <p>템플릿을 등록하고 승인받아야 합니다.</p>
              <p className="mt-4">템플릿 등록 후 1~2 영업일 내 승인됩니다.</p>
            </>
          ) : (
            <>
              <p>브랜드톡 발송을 위해서는 템플릿을 먼저 등록해야 합니다.</p>
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="font-semibold mb-2">템플릿 유형:</p>
                <p className="text-sm">기본형, 강조형, 이미지형, 와이드형, 캐러셀형</p>
              </div>
              <div className="mt-4 space-y-1">
                <p className="text-green-600">✅ 템플릿 등록 즉시 사용 가능</p>
                <p className="text-green-600">✅ 승인 절차 없이 바로 발송</p>
              </div>
            </>
          )}
        </div>
        
        <div className="space-y-3">
          <Button 
            onClick={handleGoToTemplate}
            size="lg"
            className="w-full"
          >
            템플릿 등록하러 가기
          </Button>
          
          {sendType === 'ALIMTALK' && (
            <button
              onClick={handleGoToGuide}
              className="text-blue-600 hover:underline text-sm"
            >
              템플릿 등록 가이드 보기 &gt;
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
```

#### AlimtalkSend
```typescript
const AlimtalkSend: React.FC = () => {
  const sendStore = useKakaoSendStore();
  const { sendAlimtalk, isLoading } = useKakaoSend();
  const { hasTemplate } = useTemplateCheck();
  
  // 템플릿이 없으면 발송 기능 비활성화
  const isDisabled = !hasTemplate || !sendStore.selectedTemplateId;
  
  const handleSend = async () => {
    if (isDisabled) {
      toast.error('템플릿을 선택해주세요.');
      return;
    }
    
    // 검증
    const validation = validateAlimtalkForm(sendStore.form);
    if (!validation.isValid) {
      toast.error(validation.errors[0]);
      return;
    }
    
    // 발송 확인 모달
    const confirmed = await showSendConfirmModal({
      form: sendStore.form,
      estimatedCost: sendStore.estimatedCost,
    });
    
    if (!confirmed) return;
    
    // 발송 실행
    const result = await sendAlimtalk(sendStore.form);
    
    if (result.success) {
      toast.success('발송이 완료되었습니다.');
      router.push(`/send-result/${result.data.sendId}`);
    } else {
      toast.error(result.error?.message || '발송에 실패했습니다.');
    }
  };
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-6">
        <ChannelSelect />
        <TemplateSelectModal />
        <VariableInput />
        <RecipientInput />
        <AlternativeMessageInput />
        <SendTimeSetting />
        <SendButton 
          onClick={handleSend} 
          loading={isLoading}
          disabled={isDisabled}
        />
      </div>
      
      <div className="lg:sticky lg:top-6">
        <MessagePreview />
        <CostCalculator />
      </div>
    </div>
  );
};
```

#### TemplateSelectModal
```typescript
const TemplateSelectModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const sendStore = useKakaoSendStore();
  const { templates, loadTemplates, isLoading } = useTemplateList();
  const { hasTemplate } = useTemplateCheck();
  
  useEffect(() => {
    if (isOpen && sendStore.selectedChannelId) {
      loadTemplates(sendStore.selectedChannelId, sendStore.sendType);
    }
  }, [isOpen, sendStore.selectedChannelId]);
  
  const handleSelect = (template: AlimtalkTemplate | BrandtalkTemplate) => {
    sendStore.setTemplate(template.id);
    sendStore.setVariables(extractVariables(template));
    setIsOpen(false);
  };
  
  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        템플릿 선택
      </Button>
      
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <Modal.Header>
          <h2>템플릿 선택</h2>
        </Modal.Header>
        
        <Modal.Body>
          {isLoading ? (
            <LoadingSpinner />
          ) : !hasTemplate || templates.length === 0 ? (
            <TemplateEmptyState sendType={sendStore.sendType} />
          ) : (
            <TemplateList
              templates={templates}
              onSelect={handleSelect}
            />
          )}
        </Modal.Body>
      </Modal>
    </>
  );
};
```

#### TemplateEmptyState
```typescript
const TemplateEmptyState: React.FC<{ sendType: 'ALIMTALK' | 'BRANDTALK' }> = ({ sendType }) => {
  const router = useRouter();
  
  const handleGoToTemplate = () => {
    const url = sendType === 'ALIMTALK' 
      ? '/kakao/template/alimtalk'
      : '/kakao/template/brandtalk';
    window.open(url, '_blank');
  };
  
  return (
    <div className="text-center py-12">
      <div className="text-5xl mb-4">
        {sendType === 'ALIMTALK' ? '📋' : '💬'}
      </div>
      
      <h3 className="text-lg font-semibold mb-2">
        {sendType === 'ALIMTALK'
          ? '등록된 알림톡 템플릿이 없습니다'
          : '등록된 브랜드톡 템플릿이 없습니다'}
      </h3>
      
      {sendType === 'BRANDTALK' && (
        <div className="my-4 p-3 bg-gray-50 rounded">
          <p className="text-sm text-gray-600 mb-2">템플릿 유형:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            <Badge>기본형</Badge>
            <Badge>강조형</Badge>
            <Badge>이미지형</Badge>
            <Badge>와이드형</Badge>
            <Badge>캐러셀형</Badge>
          </div>
        </div>
      )}
      
      <p className="text-gray-600 mb-4">
        {sendType === 'ALIMTALK' ? (
          <>
            알림톡 발송을 위해서는 카카오톡 채널에서<br />
            템플릿을 등록하고 승인받아야 합니다.<br />
            템플릿 등록 후 1~2 영업일 내 승인됩니다.
          </>
        ) : (
          <>
            브랜드톡 발송을 위해서는 템플릿을 먼저 등록해야 합니다.<br />
            <span className="text-green-600 font-semibold">
              ✅ 등록 즉시 사용 가능 ✅ 승인 절차 없음
            </span>
          </>
        )}
      </p>
      
      <div className="space-y-2">
        <Button onClick={handleGoToTemplate} className="w-full">
          템플릿 등록하러 가기
        </Button>
        {sendType === 'ALIMTALK' && (
          <button
            onClick={() => window.open('https://kakaobusiness.gitbook.io/main/ad/infotalk/content-guide', '_blank')}
            className="text-sm text-blue-600 hover:underline"
          >
            템플릿 등록 가이드 보기 &gt;
          </button>
        )}
      </div>
    </div>
  );
};
```

### 5.2 Custom Hooks

#### useTemplateCheck
```typescript
export function useTemplateCheck() {
  const sendStore = useKakaoSendStore();
  
  const checkTemplate = async (channelId: string) => {
    sendStore.setTemplateCheckLoading(true);
    
    try {
      const response = await apiClient.get<{ hasTemplate: boolean; templateCount: number }>(
        `/api/v1/kakao/templates/check`,
        {
          params: {
            channelId,
            sendType: sendStore.sendType,
          },
        }
      );
      
      if (response.success) {
        sendStore.setHasTemplate(response.data.hasTemplate);
        sendStore.setTemplateCount(response.data.templateCount);
      }
    } catch (error) {
      console.error('템플릿 확인 실패:', error);
      sendStore.setHasTemplate(false);
    } finally {
      sendStore.setTemplateCheckLoading(false);
    }
  };
  
  return {
    hasTemplate: sendStore.hasTemplate,
    templateCount: sendStore.templateCount,
    isLoading: sendStore.templateCheckLoading,
    checkTemplate,
  };
}
```

#### useSendTimeValidation
```typescript
export function useSendTimeValidation() {
  const validateSendTime = (date: Date): boolean => {
    const hour = date.getHours();
    const day = date.getDay(); // 0: 일요일, 6: 토요일
    
    // 평일(월-금) 확인
    if (day === 0 || day === 6) {
      return false;
    }
    
    // 08:00~21:00 확인
    if (hour < 8 || hour >= 21) {
      return false;
    }
    
    return true;
  };
  
  const isWeekend = (date: Date): boolean => {
    const day = date.getDay();
    return day === 0 || day === 6;
  };
  
  const isHoliday = (date: Date): boolean => {
    // 공휴일 체크 로직 (공휴일 API 또는 정적 데이터 사용)
    // TODO: 공휴일 API 연동
    return false;
  };
  
  return {
    validateSendTime,
    isWeekend,
    isHoliday,
  };
}
```

#### useProfileManage
```typescript
export function useProfileManage() {
  const queryClient = useQueryClient();
  
  const profileListQuery = useQuery({
    queryKey: ['profiles'],
    queryFn: () => profileService.getProfiles(),
  });
  
  const registerMutation = useMutation({
    mutationFn: (data: ProfileRegisterRequest) => 
      profileService.registerProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['profiles']);
    },
  });
  
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ProfileUpdateRequest }) =>
      profileService.updateProfile(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['profiles']);
    },
  });
  
  const deleteMutation = useMutation({
    mutationFn: (id: string) => profileService.deleteProfile(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['profiles']);
    },
  });
  
  return {
    profiles: profileListQuery.data?.profiles || [],
    isLoading: profileListQuery.isLoading,
    registerProfile: registerMutation.mutateAsync,
    updateProfile: updateMutation.mutateAsync,
    deleteProfile: deleteMutation.mutateAsync,
  };
}
```

#### useKakaoSend
```typescript
export function useKakaoSend() {
  const queryClient = useQueryClient();
  const sendStore = useKakaoSendStore();
  
  const alimtalkMutation = useApiMutation<AlimtalkSendResponse, AlimtalkSendRequest>(
    '/api/v1/kakao/alimtalk/send',
    'POST',
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries(['send-results']);
        queryClient.invalidateQueries(['balance']);
      },
    }
  );
  
  const brandtalkMutation = useApiMutation<BrandtalkSendResponse, BrandtalkSendRequest>(
    '/api/v1/kakao/brandtalk/send',
    'POST',
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries(['send-results']);
        queryClient.invalidateQueries(['balance']);
      },
    }
  );
  
  const sendAlimtalk = async (form: KakaoSendForm) => {
    const request: AlimtalkSendRequest = {
      channelId: form.channelId,
      templateId: form.templateId,
      variables: form.variables,
      recipientNumbers: form.recipientNumbers,
      alternativeMessage: form.alternativeMessage || '',
      sendMode: form.sendMode,
      scheduledAt: form.scheduledAt?.toISOString(),
    };
    
    return alimtalkMutation.mutateAsync(request);
  };
  
  const sendBrandtalk = async (form: KakaoSendForm) => {
    const request: BrandtalkSendRequest = {
      channelId: form.channelId,
      templateId: form.templateId,
      variables: form.variables,
      images: form.images,
      recipientNumbers: form.recipientNumbers,
      alternativeMessage: form.alternativeMessage,
      sendMode: form.sendMode,
      scheduledAt: form.scheduledAt?.toISOString(),
    };
    
    return brandtalkMutation.mutateAsync(request);
  };
  
  return {
    sendAlimtalk,
    sendBrandtalk,
    isLoading: alimtalkMutation.isLoading || brandtalkMutation.isLoading,
    error: alimtalkMutation.error || brandtalkMutation.error,
  };
}
```

---

## 6. 이벤트 및 메시징

### 6.1 발행 이벤트
```typescript
enum KakaoSendEvents {
  TEMPLATE_CHECKED = 'kakao.template.checked',
  TEMPLATE_NOT_FOUND = 'kakao.template.not_found',
  MESSAGE_SENT = 'kakao.message.sent',
  MESSAGE_SEND_FAILED = 'kakao.message.send_failed',
  CHANNEL_CHANGED = 'kakao.channel.changed',
}
```

### 6.2 구독 이벤트
```typescript
interface SubscribedEvents {
  'template.created': (template: Template) => void;
  'template.approved': (templateId: string) => void;
  'balance.updated': (balance: number) => void;
}
```

---

## 7. 에러 처리

### 7.1 에러 코드 정의
```typescript
enum KakaoSendErrorCode {
  NO_TEMPLATE = 'KKO_001',
  TEMPLATE_NOT_APPROVED = 'KKO_002',
  TEMPLATE_INACTIVE = 'KKO_003',
  MISSING_REQUIRED_VARIABLE = 'KKO_004',
  INVALID_PHONE_NUMBER = 'KKO_005',
  INSUFFICIENT_BALANCE = 'KKO_006',
  CHANNEL_NOT_FOUND = 'KKO_007',
  INVALID_TEMPLATE_TYPE = 'KKO_008',
}
```

### 7.2 에러 처리 전략
- **템플릿 부재 에러**: 명확한 안내 화면 표시, 등록 유도
- **템플릿 미승인 에러**: 승인 대기 안내, 예상 소요 시간 안내
- **변수 누락 에러**: 필수 변수 강조 표시
- **네트워크 에러**: 재시도 옵션 제공
- **잔액 부족**: 충전 페이지로 이동 링크 제공

---

## 8. 테스트 전략

### 8.1 단위 테스트
```typescript
describe('KakaoSendPage', () => {
  it('should show template check alert when no template', () => {
    // ...
  });
  
  it('should check template when channel changed', () => {
    // ...
  });
});

describe('useTemplateCheck', () => {
  it('should check template existence', async () => {
    // ...
  });
});
```

### 8.2 통합 테스트
- 전체 발송 플로우 테스트
- 템플릿 부재 시 안내 화면 테스트
- 템플릿 선택 → 변수 입력 → 발송 플로우
- 엑셀 업로드 → 변수 치환 → 발송 플로우

### 8.3 테스트 커버리지 목표
- **단위 테스트**: 80% 이상
- **통합 테스트**: 핵심 플로우 100%

---

## 9. 성능 최적화

### 9.1 최적화 기법
- **템플릿 존재 여부 캐싱**: 채널별 템플릿 존재 여부 캐싱 (5분)
- **코드 스플리팅**: 알림톡/브랜드톡 컴포넌트 동적 import
- **디바운싱**: 변수 입력 시 미리보기 업데이트 디바운싱
- **메모이제이션**: 템플릿 목록, 변수 목록 메모이제이션

---

## 10. 보안 고려사항

### 10.1 입력 검증
- 전화번호 형식 검증
- 변수 값 길이 제한
- 파일 업로드 검증 (확장자, 크기)

### 10.2 데이터 보호
- 수신번호 마스킹 처리 (화면 표시 시)
- 발송 전 최종 확인 필수

---

**문서 버전**: 2.0  
**작성일**: 2024-11-19  
**최종 수정일**: 2024-11-19
