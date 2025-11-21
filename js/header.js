// 공통 헤더 생성 함수
function createHeader(activeMenu = '') {
    const menuStructure = {
        'dashboard': {
            label: '대시보드',
            url: 'index.html',
            hasDropdown: false
        },
        'message': {
            label: '문자 발송',
            url: '#',
            hasDropdown: true,
            items: [
                { label: '일반문자 발송', url: 'message-send-general.html' },
                { label: '광고문자 발송', url: 'message-send-ad.html' },
                { label: '공직선거문자 발송', url: 'message-send-election.html' }
            ]
        },
        'kakao': {
            label: '카톡 발송',
            url: '#',
            hasDropdown: true,
            items: [
                { label: '알림톡 발송', url: 'kakao-send-alimtalk.html' },
                { label: '브랜드톡 발송', url: 'kakao-send-brandtalk.html' },
                { label: '발신프로필 관리', url: 'kakao-profile-manage.html' }
            ]
        },
        'template': {
            label: '템플릿',
            url: '#',
            hasDropdown: true,
            items: [
                { label: '문자', url: 'template-message.html' },
                { label: '알림톡', url: 'template-alimtalk.html' },
                { label: '브랜드톡', url: 'template-brandtalk.html' }
            ]
        },
        'addressbook': {
            label: '주소록',
            url: '#',
            hasDropdown: true,
            items: [
                { label: '주소록 관리', url: 'addressbook.html' },
                { label: '주소록 추가', url: 'addressbook.html' },
                { label: '수신거부관리', url: 'addressbook-reject.html' }
            ]
        },
        'send': {
            label: '발송 관리',
            url: '#',
            hasDropdown: true,
            items: [
                { label: '발송결과', url: 'send-result.html' },
                { label: '예약내역', url: 'send-reservation.html' }
            ]
        },
        'payment': {
            label: '결제 관리',
            url: '#',
            hasDropdown: true,
            items: [
                { label: '충전하기', url: 'payment-charge.html' },
                { label: '충전/사용 내역', url: 'payment-history.html' },
                { label: '세금계산서 발행', url: 'payment-tax.html' }
            ]
        },
        'mypage': {
            label: '마이페이지',
            url: '#',
            hasDropdown: true,
            items: [
                { label: '내 정보 수정', url: 'mypage-profile.html' },
                { label: '발신번호 관리', url: 'mypage-caller-number.html' }
            ]
        }
    };
    
    // 활성 메뉴 매핑 (URL 기반)
    const urlToMenuKey = {
        'index.html': 'dashboard',
        'message-send-general.html': 'message',
        'message-send-ad.html': 'message',
        'message-send-election.html': 'message',
        'kakao-send-alimtalk.html': 'kakao',
        'kakao-send-brandtalk.html': 'kakao',
        'template-message.html': 'template',
        'template-alimtalk.html': 'template',
        'template-brandtalk.html': 'template',
        'addressbook.html': 'addressbook',
        'addressbook-reject.html': 'addressbook',
        'send-result.html': 'send',
        'send-reservation.html': 'send',
        'payment-charge.html': 'payment',
        'payment-history.html': 'payment',
        'payment-tax.html': 'payment',
        'mypage-profile.html': 'mypage',
        'mypage-caller-number.html': 'mypage'
    };
    
    // 현재 페이지 URL에서 활성 메뉴 결정
    if (!activeMenu) {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        activeMenu = urlToMenuKey[currentPage] || 'dashboard';
    }
    
    let navHTML = '';
    
    Object.keys(menuStructure).forEach(key => {
        const menu = menuStructure[key];
        const isActive = activeMenu === key;
        
        if (menu.hasDropdown) {
            navHTML += `
                <div class="nav-item has-dropdown ${isActive ? 'active' : ''}">
                    <a href="${menu.url}" class="nav-link">${menu.label}</a>
                    <div class="nav-dropdown">
            `;
            
            menu.items.forEach(item => {
                const isItemActive = window.location.pathname.includes(item.url);
                navHTML += `
                    <a href="${item.url}" class="nav-dropdown-item ${isItemActive ? 'active' : ''}">${item.label}</a>
                `;
            });
            
            navHTML += `
                    </div>
                </div>
            `;
        } else {
            navHTML += `
                <a href="${menu.url}" class="nav-item ${isActive ? 'active' : ''}">${menu.label}</a>
            `;
        }
    });
    
    return `
        <header class="header">
            <div class="header-content">
                <div class="logo">
                    <h1>메시징 서비스</h1>
                </div>
                <nav class="main-nav">
                    ${navHTML}
                </nav>
                <div class="header-actions">
                    <div class="balance-info">
                        <span class="balance-label">잔액</span>
                        <span class="balance-amount">1,000,000원</span>
                    </div>
                    <button class="btn btn-sm btn-outline">로그아웃</button>
                </div>
            </div>
        </header>
    `;
}

