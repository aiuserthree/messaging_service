# messaging_service_admin

메시징 서비스 어드민 사이트

## 프로젝트 개요

메시징 서비스 플랫폼의 관리자 사이트입니다. HTML, CSS, JavaScript로 구현되었습니다.

## 구조

```
admin/
├── css/
│   └── admin-common.css      # 공통 스타일
├── js/
│   ├── admin-common.js       # 공통 JavaScript
│   └── sidebar.js            # 사이드바 유틸리티
├── index.html                # 대시보드
├── user-list.html            # 회원 관리
├── user-permission.html      # 권한 관리
├── caller-number-pending.html    # 발신번호 승인 대기
├── caller-number-approved.html   # 발신번호 승인 완료
├── caller-number-list.html       # 발신번호 목록
├── kakao-profile-list.html       # 발신프로필 관리
├── template-alimtalk-review.html # 알림톡 템플릿 검수
├── template-brandtalk-list.html  # 브랜드톡 템플릿
├── template-message-list.html    # 문자 템플릿
├── send-history.html             # 발송 내역 모니터링
├── send-statistics.html          # 발송 통계
├── send-policy.html              # 발송 정책 관리
├── payment-charge-list.html      # 충전 내역
├── payment-deposit.html          # 입금 확인
├── payment-pricing.html          # 요금 설정
├── reject-list.html              # 수신거부 관리
├── inquiry-list.html             # 문의 관리
├── notice-list.html              # 공지사항 관리
├── system-settings.html          # 시스템 설정
├── statistics-report.html        # 통계 및 리포트
└── security-audit.html           # 보안 및 감사
```

## 실행 방법

1. 웹 서버를 통해 `admin/index.html` 파일을 열거나
2. 로컬에서 직접 HTML 파일을 브라우저로 열어 실행할 수 있습니다.

## 주요 기능

- 사용자 관리 (회원 관리, 권한 관리)
- 발신번호 관리 (승인 대기, 승인 완료, 발신번호 목록, 발신프로필 관리)
- 템플릿 관리 (알림톡 템플릿 검수, 브랜드톡/문자 템플릿 관리)
- 발송 관리 (발송 내역 모니터링, 통계, 정책 관리)
- 결제 관리 (충전 내역, 입금 확인, 요금 설정)
- 수신거부 관리
- 문의 관리 및 공지사항 관리
- 시스템 설정
- 통계 및 리포트
- 보안 및 감사
