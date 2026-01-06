# FE-M011: SupportModule 상세 개발 설계서

## 1. 모듈 개요

### 1.1 모듈 식별 정보
- **모듈 ID**: FE-M011
- **모듈명**: SupportModule (고객센터 모듈)
- **담당 개발자**: Frontend 개발자
- **예상 개발 기간**: 6일
- **우선순위**: P1

### 1.2 모듈 목적 및 범위
- **핵심 기능**: 
  - FAQ 조회 (카테고리별 필터링, 아코디언)
  - 공지사항 목록/상세
  - 이벤트 목록/상세
  - 1:1 문의 등록/내역 조회
- **비즈니스 가치**: 사용자 자가 해결 및 문의 채널 제공
- **제외 범위**: 어드민 문의 답변 관리

### 1.3 목표 사용자
- **주 사용자 그룹**: 모든 회원
- **사용자 페르소나**: 서비스 이용 중 궁금한 점이 있는 사용자
- **사용 시나리오**: 자주 묻는 질문 확인, 문의 등록

---

## 2. 기술 아키텍처

### 2.1 모듈 구조
```
SupportModule/
├── components/
│   ├── FAQPage.tsx                  # FAQ 페이지
│   ├── FAQAccordion.tsx             # FAQ 아코디언
│   ├── FAQCategoryTabs.tsx          # 카테고리 탭
│   ├── NoticePage.tsx               # 공지사항 목록
│   ├── NoticeDetailPage.tsx         # 공지사항 상세
│   ├── EventPage.tsx                # 이벤트 목록
│   ├── EventDetailPage.tsx          # 이벤트 상세
│   ├── InquiryPage.tsx              # 1:1 문의
│   ├── InquiryForm.tsx              # 문의 등록 폼
│   └── InquiryHistory.tsx           # 문의 내역
├── hooks/
│   ├── useFAQ.ts                    # FAQ 조회
│   ├── useNotice.ts                 # 공지사항 조회
│   ├── useEvent.ts                  # 이벤트 조회
│   └── useInquiry.ts                # 문의 관리
├── services/
│   └── supportService.ts            # 고객센터 API
├── types/
│   └── support.types.ts             # 고객센터 타입
└── index.ts
```

### 2.2 기술 스택
- **프레임워크**: Next.js 14+ (App Router)
- **UI 라이브러리**: React 18+
- **상태관리**: TanStack Query
- **스타일링**: Tailwind CSS, Shadcn/ui
- **폼 관리**: React Hook Form, Zod

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
    'BE-M009: NotificationServiceModule',
  ];
  sharedComponents: [
    'Button', 'Input', 'Textarea', 'Tabs', 'FileUpload', 'Pagination'
  ];
}
```

### 3.2 API 명세
```typescript
// FAQ API
interface FAQAPI {
  'GET /api/v1/support/faq': {
    request: {
      category?: string;
      search?: string;
    };
    response: {
      faqs: FAQ[];
    };
  };
}

// 공지사항 API
interface NoticeAPI {
  'GET /api/v1/support/notices': {
    request: {
      page?: number;
      pageSize?: number;
    };
    response: {
      notices: Notice[];
      total: number;
    };
  };
  
  'GET /api/v1/support/notices/:id': {
    response: Notice;
  };
}

// 이벤트 API
interface EventAPI {
  'GET /api/v1/support/events': {
    request: {
      status?: 'ongoing' | 'ended' | 'all';
      page?: number;
    };
    response: {
      events: Event[];
      total: number;
    };
  };
  
  'GET /api/v1/support/events/:id': {
    response: Event;
  };
}

// 1:1 문의 API
interface InquiryAPI {
  'GET /api/v1/support/inquiries': {
    response: {
      inquiries: Inquiry[];
      total: number;
    };
  };
  
  'POST /api/v1/support/inquiries': {
    request: {
      category: string;
      title: string;
      content: string;
      attachments?: string[];
    };
    response: {
      inquiryId: string;
      message: string;
    };
  };
}
```

---

## 4. 데이터 모델

### 4.1 엔티티 정의
```typescript
interface FAQ {
  id: string;
  category: string;
  question: string;
  answer: string;
  sortOrder: number;
}

interface Notice {
  id: string;
  title: string;
  content: string;
  isPinned: boolean;
  viewCount: number;
  createdAt: Date;
}

interface Event {
  id: string;
  title: string;
  content: string;
  thumbnailUrl: string;
  startDate: Date;
  endDate: Date;
  status: 'ongoing' | 'ended';
  createdAt: Date;
}

interface Inquiry {
  id: string;
  userId: string;
  category: string;
  title: string;
  content: string;
  attachments: string[];
  status: 'pending' | 'answered' | 'closed';
  answer?: string;
  answeredAt?: Date;
  createdAt: Date;
}
```

---

## 5. 핵심 컴포넌트/서비스 명세

### 5.1 주요 컴포넌트

#### FAQPage
```typescript
const FAQPage: React.FC = () => {
  const [category, setCategory] = useState<string>('all');
  const { faqs, isLoading } = useFAQ(category);
  
  const categories = [
    { value: 'all', label: '전체' },
    { value: 'auth', label: '가입/인증' },
    { value: 'payment', label: '충전/결제' },
    { value: 'message', label: '문자발송' },
    { value: 'kakao', label: '카카오톡' },
    { value: 'etc', label: '기타' },
  ];
  
  return (
    <div className="container mx-auto p-6">
      <PageHeader title="FAQ" />
      
      <FAQCategoryTabs
        categories={categories}
        selected={category}
        onChange={setCategory}
      />
      
      <FAQAccordion faqs={faqs} isLoading={isLoading} />
    </div>
  );
};
```

#### FAQAccordion
```typescript
interface FAQAccordionProps {
  faqs: FAQ[];
  isLoading: boolean;
}

const FAQAccordion: React.FC<FAQAccordionProps> = ({ faqs, isLoading }) => {
  const [openId, setOpenId] = useState<string | null>(null);
  
  const handleToggle = (id: string) => {
    setOpenId(openId === id ? null : id);
  };
  
  return (
    <div className="space-y-2">
      {faqs.map((faq) => (
        <div key={faq.id} className="border rounded-lg">
          <button
            className="w-full p-4 text-left flex justify-between items-center"
            onClick={() => handleToggle(faq.id)}
          >
            <span className="font-medium">Q. {faq.question}</span>
            <ChevronIcon direction={openId === faq.id ? 'up' : 'down'} />
          </button>
          
          {openId === faq.id && (
            <div className="p-4 pt-0 border-t bg-gray-50">
              <p className="text-gray-700">A. {faq.answer}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
```

#### InquiryForm
```typescript
const InquiryForm: React.FC = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<InquiryFormData>();
  const { submitInquiry, isLoading } = useInquiry();
  
  const categories = [
    { value: 'service', label: '서비스 이용' },
    { value: 'payment', label: '결제/환불' },
    { value: 'technical', label: '기술 문의' },
    { value: 'etc', label: '기타' },
  ];
  
  const onSubmit = async (data: InquiryFormData) => {
    const result = await submitInquiry(data);
    if (result.success) {
      toast.success('문의가 등록되었습니다.');
    }
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <FormField label="문의 유형" required error={errors.category?.message}>
        <Select
          {...register('category', { required: '유형을 선택해주세요' })}
          options={categories}
          placeholder="유형 선택"
        />
      </FormField>
      
      <FormField label="제목" required error={errors.title?.message}>
        <Input
          {...register('title', { required: '제목을 입력해주세요' })}
          placeholder="제목을 입력하세요"
        />
      </FormField>
      
      <FormField label="문의 내용" required error={errors.content?.message}>
        <Textarea
          {...register('content', { required: '내용을 입력해주세요' })}
          placeholder="문의 내용을 입력하세요"
          rows={10}
        />
      </FormField>
      
      <FormField label="첨부 파일">
        <FileUpload
          accept=".jpg,.jpeg,.png,.pdf"
          maxSize={5 * 1024 * 1024}
          maxFiles={3}
        />
      </FormField>
      
      <Button type="submit" loading={isLoading}>
        등록하기
      </Button>
    </form>
  );
};
```

### 5.2 Custom Hooks

#### useFAQ
```typescript
export function useFAQ(category?: string) {
  const query = useQuery({
    queryKey: ['faq', category],
    queryFn: () => supportService.getFAQs(category),
    staleTime: 1000 * 60 * 30, // 30분 캐싱
  });
  
  return {
    faqs: query.data?.faqs || [],
    isLoading: query.isLoading,
  };
}
```

#### useInquiry
```typescript
export function useInquiry() {
  const queryClient = useQueryClient();
  
  const inquiriesQuery = useQuery({
    queryKey: ['inquiries'],
    queryFn: () => supportService.getInquiries(),
  });
  
  const submitMutation = useMutation({
    mutationFn: (data: InquiryFormData) => supportService.submitInquiry(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['inquiries']);
    },
  });
  
  return {
    inquiries: inquiriesQuery.data?.inquiries || [],
    isLoading: inquiriesQuery.isLoading,
    submitInquiry: submitMutation.mutateAsync,
    isSubmitting: submitMutation.isLoading,
  };
}
```

---

## 6. 이벤트 및 메시징

### 6.1 발행 이벤트
```typescript
enum SupportEvents {
  INQUIRY_SUBMITTED = 'support.inquiry.submitted',
  FAQ_VIEWED = 'support.faq.viewed',
}
```

---

## 7. 에러 처리

### 7.1 에러 코드 정의
```typescript
enum SupportErrorCode {
  INQUIRY_SUBMIT_FAILED = 'SUP_001',
  FILE_UPLOAD_FAILED = 'SUP_002',
  INQUIRY_NOT_FOUND = 'SUP_003',
}
```

---

## 8. 테스트 전략

### 8.1 단위 테스트
- FAQ 아코디언 토글 테스트
- 문의 폼 검증 테스트

### 8.2 테스트 커버리지 목표
- **단위 테스트**: 80% 이상

---

## 9. 성능 최적화

### 9.1 최적화 기법
- **FAQ 캐싱**: 30분 캐싱
- **페이지네이션**: 공지사항/이벤트 10건씩 로드

---

## 10. 보안 고려사항

### 10.1 입력 검증
- 문의 내용 XSS 방지
- 첨부 파일 확장자/크기 검증

### 10.2 데이터 보호
- 문의 내역 본인만 조회 가능

---

**문서 버전**: 1.0  
**작성일**: 2026-01-05
