// 공통 헤더 생성 함수
function createHeader(activeMenu = '') {
    const menuStructure = {
        'message': {
            label: '문자발송',
            url: '#',
            hasDropdown: true,
            items: [
                { label: '일반문자 발송', url: 'message-send-general.html' },
                { label: '광고문자 발송', url: 'message-send-ad.html' },
                { label: '일반문자 템플릿', url: 'template-message.html' },
                { label: '광고문자 템플릿', url: 'template-message-ad.html' }
            ]
        },
        'election': {
            label: '선거문자',
            url: 'message-send-election.html',
            hasDropdown: true,
            items: [
                { label: '선거문자 발송', url: 'message-send-election.html' },
                { label: '선거문자 주소록', url: 'election-addressbook.html' },
                { label: '수신거부관리', url: 'election-reject.html' },
                { label: '선거문자 템플릿', url: 'template-message-election.html' }
            ]
        },
        'kakao': {
            label: '카카오톡 발송',
            url: '#',
            hasDropdown: true,
            items: [
                { label: '알림톡 발송', url: 'kakao-send-alimtalk.html' },
                { label: '브랜드 메시지 발송', url: 'kakao-send-brandtalk.html' },
                { label: '카카오톡 발신 프로필', url: 'kakao-profile-manage.html' },
                { label: '알림톡 템플릿', url: 'template-alimtalk.html' },
                { label: '브랜드 메시지 템플릿', url: 'template-brandtalk.html' }
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
        'addressbook': {
            label: '주소록',
            url: '#',
            hasDropdown: true,
            items: [
                { label: '주소록 관리', url: 'addressbook.html' },
                { label: '수신거부관리', url: 'addressbook-reject.html' }
            ]
        },
        'payment': {
            label: '결제 관리',
            url: '#',
            hasDropdown: true,
            items: [
                { label: '충전하기', url: 'payment-charge.html' },
                { label: '충전 내역', url: 'payment-history.html' },
                { label: '세금계산서 발행', url: 'payment-tax.html' }
            ]
        },
        'mypage': {
            label: '마이페이지',
            url: '#',
            hasDropdown: true,
            items: [
                { label: '내 정보 수정', url: 'mypage-profile.html' },
                { label: '비밀번호 변경', url: 'mypage-password.html' },
                { label: '발신번호 관리', url: 'mypage-caller-number.html' }
            ]
        },
        'support': {
            label: '고객센터',
            url: 'support-notice.html',
            hasDropdown: true,
            items: [
                { label: '공지사항', url: 'support-notice.html' },
                { label: '이벤트', url: 'support-event.html' },
                { label: 'FAQ', url: 'support-faq.html' },
                { label: '1:1 문의', url: 'support-inquiry.html' }
            ]
        }
    };
    
    // 활성 메뉴 매핑 (URL 기반)
    const urlToMenuKey = {
        'message-send-general.html': 'message',
        'message-send-ad.html': 'message',
        'template-message.html': 'message',
        'template-message-ad.html': 'message',
        'message-send-election.html': 'election',
        'election-addressbook.html': 'election',
        'election-reject.html': 'election',
        'template-message-election.html': 'election',
        'kakao-send-alimtalk.html': 'kakao',
        'kakao-send-brandtalk.html': 'kakao',
        'kakao-profile-manage.html': 'kakao',
        'template-alimtalk.html': 'kakao',
        'template-brandtalk.html': 'kakao',
        'addressbook.html': 'addressbook',
        'addressbook-reject.html': 'addressbook',
        'send-result.html': 'send',
        'send-reservation.html': 'send',
        'payment-charge.html': 'payment',
        'payment-deposit-distribution.html': 'payment',
        'payment-history.html': 'payment',
        'payment-tax.html': 'payment',
        'mypage-profile.html': 'mypage',
        'mypage-password.html': 'mypage',
        'mypage-caller-number.html': 'mypage',
        'support-notice.html': 'support',
        'support-event.html': 'support',
        'support-faq.html': 'support',
        'support-inquiry.html': 'support'
    };
    
    // 현재 페이지 URL에서 활성 메뉴 결정
    if (!activeMenu) {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        // 메인 페이지일 때는 활성 메뉴 없음
        if (currentPage === 'main.html' || currentPage === 'index.html') {
            activeMenu = '';
        } else {
            activeMenu = urlToMenuKey[currentPage] || '';
        }
    }
    
    let navHTML = '';
    
    Object.keys(menuStructure).forEach(key => {
        const menu = menuStructure[key];
        const isActive = activeMenu === key;
        
        if (menu.hasDropdown) {
            const firstItemUrl = menu.items[0]?.url || '#';
            navHTML += `
                <div class="nav-item has-dropdown ${isActive ? 'active' : ''}">
                    <a href="#" class="nav-link" onclick="return checkLoginAndNavigate('${firstItemUrl}', event)">${menu.label}</a>
                    <div class="nav-dropdown">
            `;
            
            menu.items.forEach(item => {
                const isItemActive = window.location.pathname.includes(item.url);
                navHTML += `
                    <a href="#" class="nav-dropdown-item ${isItemActive ? 'active' : ''}" onclick="return checkLoginAndNavigate('${item.url}', event)">${item.label}</a>
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
    
    // 현재 페이지와 로그인 상태 확인
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const isLoggedIn = typeof localStorage !== 'undefined' && localStorage.getItem('isLoggedIn') === 'true';
    const isIndexPage = currentPage === 'index.html';
    
    // 헤더 액션 HTML 생성
    let headerActionsHTML = '';
    if (isIndexPage && !isLoggedIn) {
        // 로그인 전 메인 페이지
        headerActionsHTML = `
            <a href="login.html" class="btn btn-outline">로그인</a>
            <a href="login.html" class="btn btn-primary">톡벨 가입하기</a>
        `;
    } else if (isLoggedIn) {
        // 로그인 후
        headerActionsHTML = `
            <div class="balance-info balance-tooltip-wrapper">
                <span class="balance-label">잔액</span>
                <span class="balance-amount">1,000,000</span>
                <div class="balance-tooltip-content">
                    <div style="margin-bottom: 8px;">
                        <span style="color: #fbbf24; font-weight: 600;">포인트</span>
                        <span style="float: right; font-weight: 600;">1,000,000</span>
                    </div>
                    <div>
                        <div style="margin-bottom: 4px;">
                            <span style="color: #fbbf24; font-weight: 600;">마일리지</span>
                            <span style="float: right; font-weight: 600;">92.6</span>
                        </div>
                        <div style="font-size: 11px; color: #94a3b8; margin-top: 4px; text-align: left;">
                            └ 문자발송 시 사용가능 (환불불가)
                        </div>
                    </div>
                </div>
            </div>
            <a href="payment-charge.html" class="btn btn-sm btn-primary" style="padding: 6px 12px; font-size: 12px;">충전하기</a>
            <button class="btn btn-sm btn-outline" onclick="handleLogout()" style="padding: 6px 12px; font-size: 12px;">로그아웃</button>
        `;
    } else {
        // 로그인 페이지 등
        headerActionsHTML = `
            <a href="login.html" class="btn btn-outline">로그인</a>
            <a href="login.html" class="btn btn-primary">톡벨 가입하기</a>
        `;
    }
    
    return `
        <header class="header">
            <div class="header-content">
                <div class="logo">
                    <a href="index.html" style="text-decoration: none; color: inherit;">
                        <h1>Tokbell</h1>
                    </a>
                </div>
                <nav class="main-nav">
                    ${navHTML}
                </nav>
                <div class="header-actions" style="gap: 4px;">
                    ${headerActionsHTML}
                </div>
            </div>
        </header>
    `;
}

// 공통 드롭다운 메뉴 초기화 함수
function initDropdownMenus() {
    const navItems = document.querySelectorAll('.nav-item.has-dropdown');
    
    navItems.forEach(item => {
        const navLink = item.querySelector('.nav-link');
        const firstDropdownItem = item.querySelector('.nav-dropdown-item');
        const firstItemUrl = firstDropdownItem ? firstDropdownItem.getAttribute('href') : '#';
        
        // 마우스 호버 시 드롭다운 열기
        item.addEventListener('mouseenter', function() {
            // 다른 드롭다운 닫기
            navItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('open');
                }
            });
            // 현재 드롭다운 열기
            item.classList.add('open');
        });
        
        // 마우스가 떠날 때 드롭다운 닫기 (약간의 지연을 두어 드롭다운으로 이동할 시간 제공)
        let hoverTimeout;
        item.addEventListener('mouseleave', function() {
            hoverTimeout = setTimeout(() => {
                item.classList.remove('open');
            }, 200);
        });
        
        // 드롭다운 내부로 마우스가 들어오면 타이머 취소
        const dropdown = item.querySelector('.nav-dropdown');
        if (dropdown) {
            dropdown.addEventListener('mouseenter', function() {
                clearTimeout(hoverTimeout);
            });
            dropdown.addEventListener('mouseleave', function() {
                item.classList.remove('open');
            });
        }
        
        // Depth 1 메뉴 링크 클릭 시 첫 번째 depth 2 페이지로 이동
        if (navLink && firstItemUrl && firstItemUrl !== '#') {
            navLink.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                // 첫 번째 depth 2 페이지로 이동
                window.location.href = firstItemUrl;
            });
        }
    });
    
    // 외부 클릭 시 드롭다운 닫기
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.nav-item.has-dropdown')) {
            navItems.forEach(item => {
                item.classList.remove('open');
            });
        }
    });
    
    // Depth 2 메뉴 링크 클릭 시 드롭다운 닫기 (페이지 이동은 정상 작동)
    document.querySelectorAll('.nav-dropdown-item').forEach(link => {
        link.addEventListener('click', function(e) {
            e.stopPropagation();
            navItems.forEach(item => {
                item.classList.remove('open');
            });
        });
    });
}

// 플로팅 메뉴 생성 함수
function createFloatingMenu() {
    return `
        <div class="floating-menu active" id="floatingMenu">
            <button class="floating-menu-toggle active" id="floatingMenuToggle" onclick="toggleFloatingMenu()">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
            </button>
            <div class="floating-menu-items" id="floatingMenuItems">
                <a href="message-send-general.html" class="floating-menu-item" title="일반문자 발송">
                    <span class="floating-menu-icon-item blue">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                        </svg>
                    </span>
                    <span class="floating-menu-label">일반문자 발송</span>
                </a>
                <a href="message-send-ad.html" class="floating-menu-item" title="광고문자 발송">
                    <span class="floating-menu-icon-item green">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-4 6h-4v2h4v2h-4v2h4v2H9V7h6v2z"/>
                        </svg>
                    </span>
                    <span class="floating-menu-label">광고문자 발송</span>
                </a>
                <a href="message-send-election.html" class="floating-menu-item" title="선거문자 발송">
                    <span class="floating-menu-icon-item orange">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M18 13h-.68l-2 2h1.91L19 17H5l1.78-2h2.05l-2-2H6l-3 3v4c0 1.1.89 2 1.99 2H19c1.1 0 2-.89 2-2v-4l-3-3zm-1-5.05l-4.95 4.95-3.54-3.54 4.95-4.95L17 7.95zm-4.24-5.66L6.39 8.66a.996.996 0 0 0 0 1.41l4.95 4.95c.39.39 1.02.39 1.41 0l6.36-6.36a.996.996 0 0 0 0-1.41L14.16 2.3a.975.975 0 0 0-1.4-.01z"/>
                        </svg>
                    </span>
                    <span class="floating-menu-label">선거문자 발송</span>
                </a>
                <a href="kakao-send-alimtalk.html" class="floating-menu-item" title="알림톡 발송">
                    <span class="floating-menu-icon-item yellow">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 3C6.48 3 2 6.58 2 11c0 2.52 1.56 4.76 4 6.22V21l3.5-2.1c.78.13 1.62.1 2.5.1 5.52 0 10-3.58 10-8s-4.48-8-10-8z"/>
                        </svg>
                    </span>
                    <span class="floating-menu-label">알림톡 발송</span>
                </a>
                <a href="kakao-send-brandtalk.html" class="floating-menu-item" title="브랜드 메시지 발송">
                    <span class="floating-menu-icon-item purple">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
                        </svg>
                    </span>
                    <span class="floating-menu-label">브랜드 메시지 발송</span>
                </a>
                <a href="support-event.html" class="floating-menu-item" title="이벤트">
                    <span class="floating-menu-icon-item pink">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM9 10H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm-8 4H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2z"/>
                        </svg>
                    </span>
                    <span class="floating-menu-label">이벤트</span>
                </a>
                <a href="support-inquiry.html" class="floating-menu-item" title="1:1 문의">
                    <span class="floating-menu-icon-item teal">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z"/>
                        </svg>
                    </span>
                    <span class="floating-menu-label">1:1 문의</span>
                </a>
            </div>
        </div>
        <style>
            .floating-menu {
                position: fixed;
                bottom: 24px;
                right: 24px;
                z-index: 1000;
            }
            
            .floating-menu-toggle {
                width: 56px;
                height: 56px;
                border-radius: 50%;
                background: var(--primary-color);
                color: white;
                border: none;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s ease;
                font-size: 24px;
                font-weight: 300;
            }
            
            .floating-menu-toggle:hover {
                background: var(--primary-hover);
                transform: scale(1.1);
                box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
            }
            
            .floating-menu-toggle.active {
                transform: rotate(45deg);
            }
            
            .floating-menu-items {
                position: absolute;
                bottom: 70px;
                right: 0;
                display: flex;
                flex-direction: column;
                gap: 12px;
                opacity: 0;
                visibility: hidden;
                transform: translateY(20px);
                transition: all 0.3s ease;
            }
            
            .floating-menu.active .floating-menu-items {
                opacity: 1;
                visibility: visible;
                transform: translateY(0);
            }
            
            .floating-menu-item {
                display: flex;
                align-items: center;
                justify-content: flex-start;
                gap: 12px;
                text-decoration: none;
                color: var(--text-primary);
                background: white;
                padding: 12px 20px;
                border-radius: 28px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                transition: all 0.2s ease;
                white-space: nowrap;
                min-width: 180px;
            }
            
            .floating-menu-item:hover {
                background: var(--primary-color);
                color: white;
                transform: translateX(-4px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            }
            
            .floating-menu-icon-item {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 32px;
                height: 32px;
                border-radius: 50%;
                flex-shrink: 0;
                transition: all 0.2s ease;
            }
            
            .floating-menu-icon-item.blue {
                background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
                color: #2563eb;
            }
            
            .floating-menu-icon-item.green {
                background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
                color: #10b981;
            }
            
            .floating-menu-icon-item.orange {
                background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
                color: #f59e0b;
            }
            
            .floating-menu-icon-item.yellow {
                background: linear-gradient(135deg, #fef9c3 0%, #fef08a 100%);
                color: #ca8a04;
            }
            
            .floating-menu-icon-item.purple {
                background: linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%);
                color: #7c3aed;
            }
            
            .floating-menu-icon-item.pink {
                background: linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%);
                color: #db2777;
            }
            
            .floating-menu-icon-item.teal {
                background: linear-gradient(135deg, #ccfbf1 0%, #99f6e4 100%);
                color: #0d9488;
            }
            
            .floating-menu-item:hover .floating-menu-icon-item {
                background: rgba(255, 255, 255, 0.2);
                color: white;
            }
            
            .floating-menu-label {
                font-size: 14px;
                font-weight: 500;
            }
            
            @media (max-width: 768px) {
                .floating-menu {
                    bottom: 16px;
                    right: 16px;
                }
                
                .floating-menu-toggle {
                    width: 48px;
                    height: 48px;
                    font-size: 20px;
                }
                
                .floating-menu-items {
                    bottom: 60px;
                }
                
                .floating-menu-item {
                    min-width: 160px;
                    padding: 10px 16px;
                }
                
                .floating-menu-label {
                    font-size: 13px;
                }
            }
            
            /* 잔액 툴팁 스타일 */
            .balance-tooltip-wrapper {
                position: relative;
                display: inline-block;
                cursor: pointer;
            }
            
            .balance-tooltip-content {
                position: absolute;
                top: 100%;
                left: 50%;
                transform: translateX(-50%);
                margin-top: 8px;
                background: #1e293b;
                color: white;
                padding: 16px;
                border-radius: 8px;
                font-size: 13px;
                line-height: 1.6;
                white-space: normal;
                width: 200px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                opacity: 0;
                visibility: hidden;
                transition: all 0.2s;
                z-index: 1000;
            }
            
            .balance-tooltip-wrapper:hover .balance-tooltip-content {
                opacity: 1;
                visibility: visible;
            }
            
            .balance-tooltip-content::after {
                content: '';
                position: absolute;
                bottom: 100%;
                left: 50%;
                transform: translateX(-50%);
                border: 6px solid transparent;
                border-bottom-color: #1e293b;
            }
        </style>
        <script>
            function toggleFloatingMenu() {
                const menu = document.getElementById('floatingMenu');
                const toggle = document.getElementById('floatingMenuToggle');
                if (menu && toggle) {
                    menu.classList.toggle('active');
                    toggle.classList.toggle('active');
                }
            }
            
            // 외부 클릭 시 메뉴 닫기
            document.addEventListener('click', function(e) {
                const menu = document.getElementById('floatingMenu');
                const toggle = document.getElementById('floatingMenuToggle');
                if (menu && toggle && !menu.contains(e.target)) {
                    menu.classList.remove('active');
                    toggle.classList.remove('active');
                }
            });
        </script>
    `;
}

// 로그아웃 처리 함수
function handleLogout() {
    localStorage.removeItem('isLoggedIn');
    window.location.href = 'index.html';
}

// 로그인 상태 확인 및 네비게이션 함수 (로그인 체크 제거)
function checkLoginAndNavigate(url, event) {
    if (event) {
        event.preventDefault();
    }
    
    // 로그인 체크 없이 바로 이동
    window.location.href = url;
    return false;
}

