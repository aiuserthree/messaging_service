# FE-M007: MyPageModule 상세 개발 설계서

## 1. 모듈 개요

### 1.1 모듈 식별 정보
- **모듈 ID**: FE-M007
- **모듈명**: MyPageModule (마이페이지 모듈)
- **담당 개발자**: Frontend 개발자
- **예상 개발 기간**: 15일
- **우선순위**: P0

### 1.2 모듈 목적 및 범위
- **핵심 기능**: 
  - 내 정보 수정
  - 비밀번호 변경
  - 발신번호 관리
    - 발신번호 목록 조회
    - 발신번호 등록 (5단계 프로세스)
    - 발신번호 유형 자동 인식 (휴대폰/유선)
    - 명의 구분 선택 (개인: 본인/타인, 기업: 본인(자사)/타인/타사)
    - 명의 구분별 서류 제출
    - 본인인증 (휴대폰 번호인 경우만)
    - 발신번호 삭제
  - 사업자 회원 전환
- **비즈니스 가치**: 사용자 정보 관리 및 발신번호 사전등록제 준수

---

## 2. 기술 아키텍처

### 2.1 모듈 구조
```
MyPageModule/
├── components/
│   ├── MyPagePage.tsx
│   ├── ProfileEdit.tsx
│   ├── PasswordChange.tsx
│   └── CallerNumberManage.tsx
│       ├── CallerNumberList.tsx
│       ├── CallerNumberRegisterModal.tsx
│       │   ├── Step1MemberType.tsx
│       │   ├── Step2BasicInfo.tsx
│       │   ├── Step3OwnershipAuth.tsx
│       │   ├── Step4Contact.tsx
│       │   └── Step5Review.tsx
│       └── CallerNumberDeleteModal.tsx
└── hooks/
    ├── useMyPage.ts
    ├── useCallerNumber.ts
    └── usePhoneAuth.ts
```

### 2.2 발신번호 관리 주요 기능

#### 2.2.1 발신번호 유형 자동 인식
- **기능**: 발신번호 입력 시 자동으로 휴대폰/유선번호 구분
- **로직**:
  - 010으로 시작: 휴대폰 번호 → `numberType: "MOBILE"`, `requiresAuth: true`
  - 02, 031, 032, 033, 041, 042, 043, 044, 051, 052, 053, 054, 055, 061, 062, 063, 064로 시작: 유선번호 → `numberType: "LANDLINE"`, `requiresAuth: false`
- **UI 반영**: 유형 표시 뱃지, 본인인증 섹션 표시/숨김

#### 2.2.2 명의 구분 선택
- **개인 회원**:
  - 본인 명의: `ownershipType: "SELF"`
  - 타인 명의: `ownershipType: "OTHERS"`
- **기업 회원**:
  - 본인(자사) 명의: `ownershipType: "SELF"`
  - 타인 명의: `ownershipType: "OTHERS"`
  - 타사 명의: `ownershipType: "OTHER_COMPANY"`

#### 2.2.3 명의 구분별 필수 서류
- **개인 - 본인 명의**: 통신서비스 이용증명원
- **개인 - 타인 명의**: 통신서비스 이용증명원, 위임장, 재직증명서 또는 신분증
- **기업 - 본인(자사) 명의**: 사업자등록증, 재직증명서, 통신서비스 이용증명원
- **기업 - 타인 명의**: 통신서비스 이용증명원, 위임장, 재직증명서 또는 신분증
- **기업 - 타사 명의**: 통신서비스 이용증명원, 위임장, 위임 업체의 사업자등록증

#### 2.2.4 본인인증 처리
- **조건**: 발신번호가 휴대폰 번호(010 시작)인 경우만 필수
- **인증 수단**: PASS, 카카오톡, NAVER
- **인증 완료 후**: 인증 정보 자동 입력 (이름, 생년월일, 통신사)

#### 2.2.5 파일 업로드
- **용량 제한**: 최대 10MB
- **허용 형식**: jpg, jpeg, gif, png, pdf, tif, tiff, zip
- **다중 파일**: zip 파일로 압축 가능

### 2.3 API 연동

#### 2.3.1 발신번호 목록 조회
```
GET /api/v1/caller-numbers?status=ALL&page=1&size=10
```

#### 2.3.2 발신번호 유형 검증
```
GET /api/v1/caller-numbers/validate-type?number=01012345678
Response: { type: "MOBILE" | "LANDLINE", requiresAuth: boolean }
```

#### 2.3.3 발신번호 등록
```
POST /api/v1/caller-numbers
Content-Type: multipart/form-data
Body: {
  memberType: "PERSONAL" | "BUSINESS",
  ownershipType: "SELF" | "OTHERS" | "OTHER_COMPANY",
  callerNumber: string,
  numberType: "MOBILE" | "LANDLINE",
  purpose?: string,
  useIntegration: boolean,
  authToken?: string, // 휴대폰 번호인 경우만
  contactPhone: string,
  contactEmail?: string,
  files: { ... }
}
```

#### 2.3.4 본인인증
```
POST /api/v1/auth/phone-verification
Body: { phoneNumber: string, authProvider: "PASS" | "KAKAO" | "NAVER" }
Response: { authToken: string, name: string, birthDate: string, carrier: string }
```

---

## 3. 화면 흐름

### 3.1 발신번호 등록 프로세스
```
[발신번호 등록 버튼 클릭]
  ↓
[STEP 1: 회원 유형 선택]
  → 개인 / 기업 선택
  ↓
[STEP 2: 기본 정보 입력]
  → 발신번호 입력 → 유형 자동 인식
  → 발신번호 용도 입력
  → 통합용 사용 여부 선택
  ↓
[STEP 3: 명의 구분 및 서류]
  → 명의 구분 선택
  → 본인인증 (휴대폰 번호인 경우만)
  → 명의 구분별 필수 서류 제출
  ↓
[STEP 4: 연락처 정보]
  → 휴대폰번호 입력
  → 이메일 입력 (선택)
  ↓
[STEP 5: 최종 확인 및 제출]
  → 입력 정보 확인
  → 승인요청
  ↓
[제출 완료] → [승인대기 상태로 목록 추가]
```

---

## 4. 검증 로직

### 4.1 발신번호 유형 검증
```javascript
function detectNumberType(number) {
  const cleaned = number.replace(/[^0-9]/g, '');
  if (cleaned.startsWith('010')) {
    return { type: 'MOBILE', requiresAuth: true };
  }
  const landlinePattern = /^(02|0[3-6][1-5])/;
  if (landlinePattern.test(cleaned)) {
    return { type: 'LANDLINE', requiresAuth: false };
  }
  return null; // 유효하지 않은 번호
}
```

### 4.2 필수값 검증
- 회원 유형 선택 확인
- 명의 구분 선택 확인
- 발신번호 입력 및 형식 확인
- 본인인증 완료 확인 (휴대폰 번호인 경우만)
- 명의 구분별 필수 서류 첨부 확인
- 연락처 입력 확인

### 4.3 파일 검증
- 파일 형식 검증 (허용된 확장자만)
- 파일 크기 검증 (최대 10MB)

---

## 5. 상태 관리

### 5.1 발신번호 등록 상태
```typescript
interface CallerNumberRegisterState {
  step: 1 | 2 | 3 | 4 | 5;
  memberType: 'PERSONAL' | 'BUSINESS' | null;
  ownershipType: 'SELF' | 'OTHERS' | 'OTHER_COMPANY' | null;
  callerNumber: string;
  numberType: 'MOBILE' | 'LANDLINE' | null;
  requiresAuth: boolean;
  purpose: string;
  useIntegration: boolean;
  authToken: string | null;
  authInfo: {
    name: string;
    birthDate: string;
    carrier: string;
  } | null;
  documents: {
    [key: string]: File;
  };
  contactPhone: string;
  contactEmail: string;
}
```

---

**문서 버전**: 2.0  
**작성일**: 2024-11-19  
**최종 수정일**: 2024-12-02

