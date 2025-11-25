# FE-M009: CommonUIModule 상세 개발 설계서

## 1. 모듈 개요

### 1.1 모듈 식별 정보
- **모듈 ID**: FE-M009
- **모듈명**: CommonUIModule (공통 UI 컴포넌트 모듈)
- **담당 개발자**: Frontend 개발자
- **예상 개발 기간**: 10일
- **우선순위**: P0

### 1.2 모듈 목적 및 범위
- **핵심 기능**: 
  - 공통 UI 컴포넌트 제공
  - 레이아웃 컴포넌트 (GNB, 플로팅 메뉴)
  - 폼 컴포넌트
  - 모달/팝업 컴포넌트
  - GNB (Global Navigation Bar) 마우스 호버 기능
  - 플로팅 메뉴 (빠른 발송 접근)
- **비즈니스 가치**: 모든 모듈에서 재사용 가능한 UI 컴포넌트 제공, 일관된 네비게이션 경험

---

## 2. 기술 아키텍처

### 2.1 모듈 구조
```
CommonUIModule/
├── components/
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Select.tsx
│   ├── Modal.tsx
│   ├── Toast.tsx
│   ├── Table.tsx
│   └── Layout/
│       ├── Header.tsx          # GNB 포함
│       ├── Sidebar.tsx
│       ├── Footer.tsx
│       └── FloatingMenu.tsx    # 플로팅 메뉴
└── index.ts
```

### 2.2 기술 스택
- **UI 라이브러리**: Shadcn/ui
- **스타일링**: Tailwind CSS
- **아이콘**: Lucide React

---

## 3. 인터페이스 정의

### 3.1 외부 의존성
```typescript
interface ExternalDependencies {
  modules: [];
  apis: [];
  sharedComponents: [];
  utils: [];
}
```

### 3.2 제공 인터페이스
```typescript
export interface CommonUIModuleInterface {
  components: {
    Button: React.FC<ButtonProps>;
    Input: React.FC<InputProps>;
    Select: React.FC<SelectProps>;
    Modal: React.FC<ModalProps>;
    Toast: React.FC<ToastProps>;
    Table: React.FC<TableProps>;
  };
}
```

---

## 4. 핵심 컴포넌트/서비스 명세

### 4.1 주요 컴포넌트

#### Button
```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  onClick,
  children,
}) => {
  return (
    <button
      className={cn(
        'btn',
        `btn-${variant}`,
        `btn-${size}`,
        (loading || disabled) && 'btn-disabled'
      )}
      onClick={onClick}
      disabled={loading || disabled}
    >
      {loading && <Spinner />}
      {children}
    </button>
  );
};
```

---

## 4. 핵심 컴포넌트/서비스 명세

### 4.2 GNB (Global Navigation Bar)

#### Header 컴포넌트
- **기능**: 전역 네비게이션 바 제공
- **메뉴 구조**:
  - 발송 관리 (발송결과, 예약내역)
  - 문자 발송 (일반문자 발송, 광고문자 발송, 공직선거문자 발송)
  - 카톡 발송 (알림톡 발송, 브랜드톡 발송, 발신프로필 관리)
  - 템플릿 (문자, 알림톡, 브랜드톡)
  - 주소록 (주소록 관리, 수신거부관리)
  - 결제 관리 (충전하기, 충전/사용 내역, 세금계산서 발행)
  - 마이페이지 (내 정보 수정, 비밀번호 변경, 발신번호 관리)
- **마우스 호버 기능**:
  - Depth 1 메뉴에 마우스 호버 시 Depth 2 메뉴 자동 드롭다운
  - 마우스가 떠날 때 200ms 지연 후 드롭다운 닫기
  - 드롭다운 내부로 마우스 이동 시 드롭다운 유지
- **클릭 동작**:
  - Depth 1 메뉴 클릭 시 첫 번째 Depth 2 페이지로 이동
  - Depth 2 메뉴 클릭 시 해당 페이지로 이동
- **활성 메뉴 표시**: 현재 페이지에 해당하는 메뉴 자동 활성화

### 4.3 플로팅 메뉴 (Floating Menu)

#### FloatingMenu 컴포넌트
- **기능**: 빠른 발송 접근을 위한 플로팅 액션 버튼
- **메뉴 항목** (순서대로):
  1. 일반문자 발송
  2. 광고문자 발송
  3. 공직선거문자 발송
  4. 알림톡 발송
  5. 브랜드톡 발송
- **기본 상태**: 페이지 로드 시 기본적으로 펼쳐진 상태 (active)
- **위치**: 화면 우측 하단 고정
- **동작**: 토글 버튼 클릭으로 메뉴 열기/닫기
- **표시**: 모든 페이지에서 표시

**문서 버전**: 1.1  
**작성일**: 2024-11-19  
**최종 수정일**: 2024-11-19

