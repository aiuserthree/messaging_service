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
  - 레이아웃 컴포넌트
  - 폼 컴포넌트
  - 모달/팝업 컴포넌트
- **비즈니스 가치**: 모든 모듈에서 재사용 가능한 UI 컴포넌트 제공

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
│       ├── Header.tsx
│       ├── Sidebar.tsx
│       └── Footer.tsx
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

**문서 버전**: 1.0  
**작성일**: 2024-11-19

