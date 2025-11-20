// 모든 HTML 파일의 헤더를 드롭다운 메뉴로 업데이트하는 스크립트
// 이 스크립트는 개발 시 사용하며, 실제 배포 시에는 각 HTML 파일이 이미 업데이트되어 있어야 합니다.

const headerHTML = `
                <nav class="main-nav">
                    <a href="index.html" class="nav-item">대시보드</a>
                    <div class="nav-item has-dropdown">
                        <a href="#" class="nav-link">문자 발송</a>
                        <div class="nav-dropdown">
                            <a href="message-send-general.html" class="nav-dropdown-item">일반문자 발송</a>
                            <a href="message-send-ad.html" class="nav-dropdown-item">광고문자 발송</a>
                            <a href="message-send-election.html" class="nav-dropdown-item">공직선거문자 발송</a>
                        </div>
                    </div>
                    <div class="nav-item has-dropdown">
                        <a href="#" class="nav-link">카톡 발송</a>
                        <div class="nav-dropdown">
                            <a href="kakao-send-alimtalk.html" class="nav-dropdown-item">알림톡 발송</a>
                            <a href="kakao-send-brandtalk.html" class="nav-dropdown-item">브랜드톡 발송</a>
                        </div>
                    </div>
                    <div class="nav-item has-dropdown">
                        <a href="#" class="nav-link">템플릿</a>
                        <div class="nav-dropdown">
                            <a href="template-message.html" class="nav-dropdown-item">문자</a>
                            <a href="template-alimtalk.html" class="nav-dropdown-item">알림톡</a>
                            <a href="template-brandtalk.html" class="nav-dropdown-item">브랜드톡</a>
                        </div>
                    </div>
                    <div class="nav-item has-dropdown">
                        <a href="#" class="nav-link">주소록</a>
                        <div class="nav-dropdown">
                            <a href="addressbook.html" class="nav-dropdown-item">주소록 관리</a>
                            <a href="addressbook.html" class="nav-dropdown-item">주소록 추가</a>
                            <a href="addressbook-reject.html" class="nav-dropdown-item">수신거부관리</a>
                        </div>
                    </div>
                    <div class="nav-item has-dropdown">
                        <a href="#" class="nav-link">발송 관리</a>
                        <div class="nav-dropdown">
                            <a href="send-result.html" class="nav-dropdown-item">발송결과</a>
                            <a href="send-reservation.html" class="nav-dropdown-item">예약내역</a>
                        </div>
                    </div>
                    <div class="nav-item has-dropdown">
                        <a href="#" class="nav-link">결제 관리</a>
                        <div class="nav-dropdown">
                            <a href="payment-charge.html" class="nav-dropdown-item">충전하기</a>
                            <a href="payment-history.html" class="nav-dropdown-item">충전/사용 내역</a>
                            <a href="payment-tax.html" class="nav-dropdown-item">세금계산서 발행</a>
                        </div>
                    </div>
                    <div class="nav-item has-dropdown">
                        <a href="#" class="nav-link">마이페이지</a>
                        <div class="nav-dropdown">
                            <a href="mypage-profile.html" class="nav-dropdown-item">내 정보 수정</a>
                            <a href="mypage-caller-number.html" class="nav-dropdown-item">발신번호 관리</a>
                        </div>
                    </div>
                </nav>
`;

// 페이지별 활성 메뉴 설정 함수
function getActiveMenuForPage(pageName) {
    const activeMenus = {
        'index.html': { main: 'dashboard', sub: '' },
        'message-send-general.html': { main: 'message', sub: 'message-send-general.html' },
        'message-send-ad.html': { main: 'message', sub: 'message-send-ad.html' },
        'message-send-election.html': { main: 'message', sub: 'message-send-election.html' },
        'kakao-send-alimtalk.html': { main: 'kakao', sub: 'kakao-send-alimtalk.html' },
        'kakao-send-brandtalk.html': { main: 'kakao', sub: 'kakao-send-brandtalk.html' },
        'template-message.html': { main: 'template', sub: 'template-message.html' },
        'template-alimtalk.html': { main: 'template', sub: 'template-alimtalk.html' },
        'template-brandtalk.html': { main: 'template', sub: 'template-brandtalk.html' },
        'addressbook.html': { main: 'addressbook', sub: 'addressbook.html' },
        'addressbook-reject.html': { main: 'addressbook', sub: 'addressbook-reject.html' },
        'send-result.html': { main: 'send', sub: 'send-result.html' },
        'send-reservation.html': { main: 'send', sub: 'send-reservation.html' },
        'payment-charge.html': { main: 'payment', sub: 'payment-charge.html' },
        'payment-history.html': { main: 'payment', sub: 'payment-history.html' },
        'payment-tax.html': { main: 'payment', sub: 'payment-tax.html' },
        'mypage-profile.html': { main: 'mypage', sub: 'mypage-profile.html' },
        'mypage-caller-number.html': { main: 'mypage', sub: 'mypage-caller-number.html' }
    };
    
    return activeMenus[pageName] || { main: '', sub: '' };
}

