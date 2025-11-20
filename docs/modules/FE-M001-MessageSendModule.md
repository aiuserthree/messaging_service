# FE-M001: MessageSendModule 상세 개발 설계서

## 1. 모듈 개요

### 1.1 모듈 식별 정보
- **모듈 ID**: FE-M001
- **모듈명**: MessageSendModule (문자 발송 모듈)
- **담당 개발자**: Frontend 개발자
- **예상 개발 기간**: 15일
- **우선순위**: P0

### 1.2 모듈 목적 및 범위
- **핵심 기능**: 
  - 일반문자 발송 (SMS/LMS/MMS)
  - 광고문자 발송 (법적 규정 준수)
  - 공직선거문자 발송 (선거법 준수)
  - 발신번호 선택
  - 수신번호 입력 (직접입력/주소록/엑셀)
  - 메시지 작성 및 미리보기
  - 템플릿 선택
  - 즉시/예약 발송
- **비즈니스 가치**: 사용자가 다양한 유형의 문자메시지를 효율적으로 발송할 수 있는 핵심 기능 제공
- **제외 범위**: 발송 결과 조회 (FE-M005), 템플릿 관리 (FE-M003)

### 1.3 목표 사용자
- **주 사용자 그룹**: 개인/기업 회원
- **사용자 페르소나**: 마케팅 담당자, 행정 담당자, 선거 캠페인 매니저
- **사용 시나리오**: 이벤트 홍보, 공지사항 발송, 선거 캠페인

---

## 2. 기술 아키텍처

### 2.1 모듈 구조
```
MessageSendModule/
├── components/
│   ├── MessageSendPage.tsx          # 메인 페이지
│   ├── GeneralMessageSend.tsx       # 일반문자 발송
│   ├── AdMessageSend.tsx            # 광고문자 발송
│   ├── ElectionMessageSend.tsx      # 공직선거문자 발송
│   ├── CallerNumberSelect.tsx       # 발신번호 선택
│   ├── RecipientInput.tsx           # 수신번호 입력
│   ├── MessageEditor.tsx            # 메시지 작성
│   ├── MessagePreview.tsx           # 메시지 미리보기
│   ├── TemplateSelectModal.tsx      # 템플릿 선택 모달
│   ├── ExcelUploadModal.tsx         # 엑셀 업로드 모달
│   └── SendConfirmModal.tsx         # 발송 확인 모달
├── hooks/
│   ├── useMessageSend.ts            # 발송 로직 훅
│   ├── useRecipientInput.ts         # 수신번호 입력 훅
│   ├── useMessageEditor.ts          # 메시지 편집 훅
│   └── useTemplateSelect.ts         # 템플릿 선택 훅
├── services/
│   ├── messageService.ts            # 발송 API 호출
│   ├── templateService.ts           # 템플릿 조회
│   └── validationService.ts         # 입력 검증
├── types/
│   ├── message.types.ts             # 메시지 타입
│   └── send.types.ts                # 발송 타입
├── utils/
│   ├── byteCalculator.ts            # 바이트 계산
│   ├── phoneValidator.ts            # 전화번호 검증
│   └── messageFormatter.ts          # 메시지 포맷팅
├── tests/
│   ├── MessageSendPage.test.tsx
│   └── components.test.tsx
└── index.ts
```

### 2.2 기술 스택
- **프레임워크**: Next.js 14+ (App Router)
- **UI 라이브러리**: React 18+
- **상태관리**: TanStack Query, Zustand
- **스타일링**: Tailwind CSS, Shadcn/ui
- **폼 관리**: React Hook Form, Zod
- **테스트**: Jest, React Testing Library

---

## 3. 인터페이스 정의

### 3.1 외부 의존성
```typescript
interface ExternalDependencies {
  modules: [
    'FE-M008: AuthModule',           // 인증 확인
    'FE-M009: CommonUIModule',       // 공통 UI 컴포넌트
    'FE-M003: TemplateManageModule', // 템플릿 조회
    'FE-M004: AddressBookModule',    // 주소록 선택
  ];
  apis: [
    'BE-M001: MessageServiceModule', // 발송 API
    'BE-M003: TemplateServiceModule', // 템플릿 API
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
export interface MessageSendModuleInterface {
  components: {
    MessageSendPage: React.FC<MessageSendPageProps>;
    GeneralMessageSend: React.FC<GeneralMessageSendProps>;
    AdMessageSend: React.FC<AdMessageSendProps>;
    ElectionMessageSend: React.FC<ElectionMessageSendProps>;
  };
  
  hooks: {
    useMessageSend: () => UseMessageSendReturn;
    useRecipientInput: () => UseRecipientInputReturn;
    useMessageEditor: () => UseMessageEditorReturn;
  };
  
  types: {
    MessageType: 'SMS' | 'LMS' | 'MMS';
    SendType: 'GENERAL' | 'AD' | 'ELECTION';
    SendMode: 'IMMEDIATE' | 'SCHEDULED';
  };
}
```

### 3.3 API 명세
```typescript
// 발송 API
interface SendMessageAPI {
  'POST /api/v1/messages/send': {
    request: {
      sendType: 'GENERAL' | 'AD' | 'ELECTION';
      callerNumber: string;
      recipientNumbers: string[];
      messageType: 'SMS' | 'LMS' | 'MMS';
      content: string;
      title?: string;
      images?: string[]; // 이미지 URL
      sendMode: 'IMMEDIATE' | 'SCHEDULED';
      scheduledAt?: string;
      templateId?: string;
      electionReportNumber?: string; // 공직선거용
    };
    response: {
      sendId: string;
      totalCount: number;
      successCount: number;
      failCount: number;
      estimatedCost: number;
      scheduledAt?: string;
    };
    errors: [
      'INSUFFICIENT_BALANCE',
      'INVALID_PHONE_NUMBER',
      'INVALID_MESSAGE_TYPE',
      'MESSAGE_TOO_LONG',
      'CALLER_NUMBER_NOT_APPROVED',
      'ELECTION_PERIOD_INVALID',
      'ELECTION_TIME_INVALID',
    ];
  };
  
  'POST /api/v1/messages/test-send': {
    request: {
      callerNumber: string;
      recipientNumber: string;
      messageType: 'SMS' | 'LMS' | 'MMS';
      content: string;
      title?: string;
    };
    response: {
      success: boolean;
      message: string;
    };
  };
}
```

---

## 4. 데이터 모델

### 4.1 엔티티 정의
```typescript
interface MessageSendForm {
  sendType: 'GENERAL' | 'AD' | 'ELECTION';
  callerNumber: string;
  recipientNumbers: string[];
  messageType: 'SMS' | 'LMS' | 'MMS';
  content: string;
  title?: string;
  images?: File[];
  sendMode: 'IMMEDIATE' | 'SCHEDULED';
  scheduledAt?: Date;
  templateId?: string;
  electionReportNumber?: string;
}

interface CallerNumber {
  id: string;
  number: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  purpose?: string;
  has080Number?: boolean; // 광고문자용
  isElectionNumber?: boolean; // 공직선거용
}

interface MessageTemplate {
  id: string;
  name: string;
  category: string;
  messageType: 'SMS' | 'LMS' | 'MMS';
  content: string;
  title?: string;
  variables?: string[];
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
  recipientNumbers: string[];
  
  @IsEnum(['SMS', 'LMS', 'MMS'])
  messageType: string;
  
  @IsString()
  @IsNotEmpty()
  content: string;
  
  @IsOptional()
  @IsString()
  title?: string;
  
  @IsOptional()
  @IsArray()
  images?: string[];
  
  @IsEnum(['IMMEDIATE', 'SCHEDULED'])
  sendMode: string;
  
  @IsOptional()
  @IsDateString()
  scheduledAt?: string;
}
```

### 4.3 상태 관리 스키마
```typescript
// Zustand Store
interface MessageSendStore {
  // 폼 상태
  form: MessageSendForm;
  
  // 발신번호 목록
  callerNumbers: CallerNumber[];
  selectedCallerNumber: string | null;
  
  // 수신번호 목록
  recipientNumbers: string[];
  recipientInputMode: 'DIRECT' | 'ADDRESS_BOOK' | 'EXCEL';
  
  // 메시지 상태
  messageContent: string;
  messageTitle?: string;
  messageType: 'SMS' | 'LMS' | 'MMS';
  images: File[];
  
  // 발송 설정
  sendMode: 'IMMEDIATE' | 'SCHEDULED';
  scheduledAt?: Date;
  
  // 계산된 값
  byteCount: number;
  estimatedCost: number;
  recipientCount: number;
  
  // 액션
  setCallerNumber: (number: string) => void;
  setRecipientNumbers: (numbers: string[]) => void;
  setMessageContent: (content: string) => void;
  setMessageType: (type: 'SMS' | 'LMS' | 'MMS') => void;
  setSendMode: (mode: 'IMMEDIATE' | 'SCHEDULED') => void;
  setScheduledAt: (date: Date) => void;
  calculateCost: () => void;
  resetForm: () => void;
}
```

---

## 5. 핵심 컴포넌트/서비스 명세

### 5.1 주요 컴포넌트

#### MessageSendPage
```typescript
interface MessageSendPageProps {
  sendType?: 'GENERAL' | 'AD' | 'ELECTION';
}

const MessageSendPage: React.FC<MessageSendPageProps> = ({ sendType = 'GENERAL' }) => {
  const { user } = useAuth();
  const { callerNumbers, loadCallerNumbers } = useCallerNumbers();
  const sendStore = useMessageSendStore();
  
  useEffect(() => {
    loadCallerNumbers();
  }, []);
  
  // 발신번호 미등록 체크
  const hasApprovedCallerNumber = callerNumbers.some(
    cn => cn.status === 'APPROVED'
  );
  
  if (!hasApprovedCallerNumber) {
    return <CallerNumberAlert />;
  }
  
  return (
    <div className="container mx-auto p-6">
      <PageHeader title={getPageTitle(sendType)} />
      
      {sendType === 'GENERAL' && <GeneralMessageSend />}
      {sendType === 'AD' && <AdMessageSend />}
      {sendType === 'ELECTION' && <ElectionMessageSend />}
    </div>
  );
};
```

#### GeneralMessageSend
```typescript
const GeneralMessageSend: React.FC = () => {
  const sendStore = useMessageSendStore();
  const { sendMessage, isLoading } = useMessageSend();
  
  const handleSend = async () => {
    // 검증
    const validation = validateForm(sendStore.form);
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
    const result = await sendMessage(sendStore.form);
    
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
        <CallerNumberSelect />
        <RecipientInput />
        <MessageEditor />
        <SendTimeSetting />
        <SendButton onClick={handleSend} loading={isLoading} />
      </div>
      
      <div className="lg:sticky lg:top-6">
        <MessagePreview />
        <CostCalculator />
      </div>
    </div>
  );
};
```

#### CallerNumberSelect
```typescript
const CallerNumberSelect: React.FC = () => {
  const { callerNumbers, loadCallerNumbers } = useCallerNumbers();
  const sendStore = useMessageSendStore();
  const sendType = useSendType(); // 'GENERAL' | 'AD' | 'ELECTION'
  
  // 발신번호 필터링
  const availableNumbers = useMemo(() => {
    return callerNumbers.filter(cn => {
      if (cn.status !== 'APPROVED') return false;
      
      if (sendType === 'AD' && !cn.has080Number) return false;
      if (sendType === 'ELECTION' && !cn.isElectionNumber) return false;
      
      return true;
    });
  }, [callerNumbers, sendType]);
  
  return (
    <Select
      label="발신번호"
      value={sendStore.selectedCallerNumber}
      onChange={(value) => sendStore.setCallerNumber(value)}
      options={availableNumbers.map(cn => ({
        value: cn.number,
        label: `${cn.number}${cn.purpose ? ` (${cn.purpose})` : ''}`,
      }))}
      placeholder="발신번호를 선택하세요"
      required
    />
  );
};
```

#### RecipientInput
```typescript
const RecipientInput: React.FC = () => {
  const sendStore = useMessageSendStore();
  const [inputMode, setInputMode] = useState<'DIRECT' | 'ADDRESS_BOOK' | 'EXCEL'>('DIRECT');
  
  const handleDirectInput = (value: string) => {
    const numbers = parsePhoneNumbers(value);
    sendStore.setRecipientNumbers([...sendStore.recipientNumbers, ...numbers]);
  };
  
  const handleAddressBookSelect = async () => {
    const selected = await showAddressBookModal();
    if (selected) {
      sendStore.setRecipientNumbers([...sendStore.recipientNumbers, ...selected]);
    }
  };
  
  const handleExcelUpload = async (file: File) => {
    const numbers = await parseExcelFile(file);
    sendStore.setRecipientNumbers([...sendStore.recipientNumbers, ...numbers]);
  };
  
  return (
    <div className="space-y-4">
      <Tabs value={inputMode} onValueChange={setInputMode}>
        <TabsList>
          <TabsTrigger value="DIRECT">직접입력</TabsTrigger>
          <TabsTrigger value="ADDRESS_BOOK">주소록</TabsTrigger>
          <TabsTrigger value="EXCEL">엑셀 업로드</TabsTrigger>
        </TabsList>
        
        <TabsContent value="DIRECT">
          <Textarea
            placeholder="전화번호를 입력하세요 (콤마 또는 엔터로 구분)"
            onChange={(e) => handleDirectInput(e.target.value)}
          />
        </TabsContent>
        
        <TabsContent value="ADDRESS_BOOK">
          <Button onClick={handleAddressBookSelect}>
            주소록에서 선택
          </Button>
        </TabsContent>
        
        <TabsContent value="EXCEL">
          <FileUpload
            accept=".xlsx,.xls,.csv"
            onUpload={handleExcelUpload}
            maxSize={10 * 1024 * 1024} // 10MB
          />
        </TabsContent>
      </Tabs>
      
      <RecipientList
        numbers={sendStore.recipientNumbers}
        onRemove={(index) => {
          const newNumbers = [...sendStore.recipientNumbers];
          newNumbers.splice(index, 1);
          sendStore.setRecipientNumbers(newNumbers);
        }}
      />
      
      <div className="text-sm text-gray-600">
        총 {sendStore.recipientCount}명
      </div>
    </div>
  );
};
```

#### MessageEditor
```typescript
const MessageEditor: React.FC = () => {
  const sendStore = useMessageSendStore();
  const { insertTemplate, insertVariable } = useMessageEditor();
  
  const handleContentChange = (content: string) => {
    sendStore.setMessageContent(content);
    
    // 바이트 계산 및 메시지 타입 자동 전환
    const byteCount = calculateByteCount(content);
    sendStore.setByteCount(byteCount);
    
    if (byteCount > 90 && sendStore.messageType === 'SMS') {
      sendStore.setMessageType('LMS');
    }
  };
  
  const handleTemplateSelect = async () => {
    const template = await showTemplateSelectModal({
      messageType: sendStore.messageType,
    });
    
    if (template) {
      insertTemplate(template);
    }
  };
  
  return (
    <div className="space-y-4">
      {sendStore.messageType !== 'SMS' && (
        <Input
          label="제목"
          value={sendStore.messageTitle || ''}
          onChange={(e) => sendStore.setMessageTitle(e.target.value)}
          maxLength={40}
        />
      )}
      
      <div>
        <div className="flex justify-between items-center mb-2">
          <Label>메시지 내용</Label>
          <div className="text-sm text-gray-600">
            {sendStore.byteCount} / {getMaxByte(sendStore.messageType)} 바이트
          </div>
        </div>
        
        <Textarea
          value={sendStore.messageContent}
          onChange={(e) => handleContentChange(e.target.value)}
          rows={10}
          maxLength={getMaxLength(sendStore.messageType)}
        />
        
        <div className="flex gap-2 mt-2">
          <Button variant="outline" onClick={handleTemplateSelect}>
            템플릿 선택
          </Button>
          <VariableInsertButton onInsert={insertVariable} />
        </div>
      </div>
      
      {sendStore.messageType === 'MMS' && (
        <ImageUpload
          images={sendStore.images}
          onAdd={(file) => sendStore.addImage(file)}
          onRemove={(index) => sendStore.removeImage(index)}
          maxCount={3}
          maxSize={300 * 1024} // 300KB
        />
      )}
    </div>
  );
};
```

### 5.2 Custom Hooks

#### useMessageSend
```typescript
export function useMessageSend() {
  const queryClient = useQueryClient();
  
  const mutation = useApiMutation<SendMessageResponse, SendMessageRequest>(
    '/api/v1/messages/send',
    'POST',
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries(['send-results']);
        queryClient.invalidateQueries(['balance']);
      },
    }
  );
  
  const sendMessage = async (form: MessageSendForm) => {
    const request: SendMessageRequest = {
      sendType: form.sendType,
      callerNumber: form.callerNumber,
      recipientNumbers: form.recipientNumbers,
      messageType: form.messageType,
      content: form.content,
      title: form.title,
      images: form.images?.map(img => img.name), // 실제로는 업로드 후 URL
      sendMode: form.sendMode,
      scheduledAt: form.scheduledAt?.toISOString(),
      templateId: form.templateId,
      electionReportNumber: form.electionReportNumber,
    };
    
    return mutation.mutateAsync(request);
  };
  
  return {
    sendMessage,
    isLoading: mutation.isLoading,
    error: mutation.error,
  };
}
```

---

## 6. 이벤트 및 메시징

### 6.1 발행 이벤트
```typescript
enum MessageSendEvents {
  MESSAGE_SENT = 'message.send.sent',
  MESSAGE_SEND_FAILED = 'message.send.failed',
  RECIPIENT_COUNT_CHANGED = 'message.recipient.count.changed',
  COST_CALCULATED = 'message.cost.calculated',
}
```

### 6.2 구독 이벤트
```typescript
interface SubscribedEvents {
  'addressbook.selected': (numbers: string[]) => void;
  'template.selected': (template: MessageTemplate) => void;
  'balance.updated': (balance: number) => void;
}
```

---

## 7. 에러 처리

### 7.1 에러 코드 정의
```typescript
enum MessageSendErrorCode {
  CALLER_NUMBER_NOT_SELECTED = 'MSG_001',
  RECIPIENT_NUMBER_EMPTY = 'MSG_002',
  MESSAGE_CONTENT_EMPTY = 'MSG_003',
  MESSAGE_TOO_LONG = 'MSG_004',
  INSUFFICIENT_BALANCE = 'MSG_005',
  INVALID_PHONE_NUMBER = 'MSG_006',
  CALLER_NUMBER_NOT_APPROVED = 'MSG_007',
  AD_TIME_RESTRICTION = 'MSG_008',
  ELECTION_PERIOD_INVALID = 'MSG_009',
  ELECTION_FORBIDDEN_WORD = 'MSG_010',
}
```

### 7.2 에러 처리 전략
- **입력 검증 에러**: 실시간 표시, 필드 하단에 오류 메시지
- **비즈니스 로직 에러**: 토스트 메시지로 안내
- **네트워크 에러**: 재시도 옵션 제공
- **잔액 부족**: 충전 페이지로 이동 링크 제공

---

## 8. 테스트 전략

### 8.1 단위 테스트
```typescript
describe('MessageSendPage', () => {
  it('should render correctly', () => {
    render(<MessageSendPage sendType="GENERAL" />);
    expect(screen.getByText('일반문자 발송')).toBeInTheDocument();
  });
  
  it('should show caller number alert when no approved number', () => {
    // ...
  });
});

describe('useMessageSend', () => {
  it('should send message successfully', async () => {
    // ...
  });
});
```

### 8.2 통합 테스트
- 전체 발송 플로우 테스트
- 템플릿 선택 → 메시지 작성 → 발송 플로우
- 주소록 선택 → 발송 플로우

### 8.3 테스트 커버리지 목표
- **단위 테스트**: 80% 이상
- **통합 테스트**: 핵심 플로우 100%

---

## 9. 성능 최적화

### 9.1 최적화 기법
- **코드 스플리팅**: 발송 타입별 동적 import
- **이미지 최적화**: 업로드 전 리사이징
- **디바운싱**: 수신번호 입력 시 검증 디바운싱
- **메모이제이션**: 비용 계산 결과 캐싱

---

## 10. 보안 고려사항

### 10.1 입력 검증
- 전화번호 형식 검증
- 메시지 내용 XSS 방지
- 파일 업로드 검증 (확장자, 크기)

### 10.2 데이터 보호
- 수신번호 마스킹 처리 (화면 표시 시)
- 발송 전 최종 확인 필수

---

**문서 버전**: 1.0  
**작성일**: 2024-11-19

