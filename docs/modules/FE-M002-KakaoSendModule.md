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
  - 알림톡 발송 (템플릿 존재 여부 최우선 확인)
  - 브랜드톡 발송 (템플릿 존재 여부 최우선 확인)
  - 템플릿 선택 및 검증
  - 변수 입력 및 치환
  - 대체 메시지 설정
  - 엑셀 업로드 (변수 치환 지원)
  - 실시간 미리보기
- **비즈니스 가치**: 카카오톡을 통한 메시지 발송 기능 제공, 템플릿 부재 시 명확한 안내 및 등록 유도
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
│   ├── AlimtalkSend.tsx               # 알림톡 발송
│   ├── BrandtalkSend.tsx              # 브랜드톡 발송
│   ├── TemplateCheckAlert.tsx         # 템플릿 부재 안내
│   ├── ChannelSelect.tsx              # 채널/프로필 선택
│   ├── TemplateSelectModal.tsx        # 템플릿 선택 모달
│   ├── VariableInput.tsx              # 변수 입력
│   ├── RecipientInput.tsx             # 수신번호 입력
│   ├── ExcelUploadModal.tsx           # 엑셀 업로드 모달
│   ├── MessagePreview.tsx             # 메시지 미리보기
│   └── AlternativeMessageInput.tsx    # 대체 메시지 입력
├── hooks/
│   ├── useKakaoSend.ts                # 발송 로직 훅
│   ├── useTemplateCheck.ts            # 템플릿 존재 여부 확인
│   ├── useVariableInput.ts            # 변수 입력 훅
│   └── useExcelUpload.ts              # 엑셀 업로드 훅
├── services/
│   ├── kakaoService.ts                # 발송 API 호출
│   ├── templateService.ts             # 템플릿 조회
│   └── excelService.ts                # 엑셀 파싱
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
    AlimtalkSend: React.FC<AlimtalkSendProps>;
    BrandtalkSend: React.FC<BrandtalkSendProps>;
    TemplateCheckAlert: React.FC<TemplateCheckAlertProps>;
  };
  
  hooks: {
    useKakaoSend: () => UseKakaoSendReturn;
    useTemplateCheck: () => UseTemplateCheckReturn;
    useVariableInput: () => UseVariableInputReturn;
  };
  
  types: {
    SendType: 'ALIMTALK' | 'BRANDTALK';
    TemplateType: 'BASIC' | 'HIGHLIGHT' | 'IMAGE' | 'WIDE' | 'CAROUSEL';
    TemplateStatus: 'APPROVED' | 'PENDING' | 'REJECTED' | 'ACTIVE' | 'INACTIVE';
  };
}
```

### 3.3 API 명세
```typescript
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
    // 가이드 페이지로 이동
    router.push(`/guide/template/${sendType}`);
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
          
          <button
            onClick={handleGoToGuide}
            className="text-blue-600 hover:underline text-sm"
          >
            템플릿 등록 가이드 보기 &gt;
          </button>
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
        <button
          onClick={() => router.push(`/guide/template/${sendType}`)}
          className="text-sm text-blue-600 hover:underline"
        >
          템플릿 등록 가이드 보기 &gt;
        </button>
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
