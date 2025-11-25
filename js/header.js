// 공통 헤더 생성 함수
function createHeader(activeMenu = '') {
    const menuStructure = {
        'send': {
            label: '발송 관리',
            url: '#',
            hasDropdown: true,
            items: [
                { label: '발송결과', url: 'send-result.html' },
                { label: '예약내역', url: 'send-reservation.html' }
            ]
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
                { label: '수신거부관리', url: 'addressbook-reject.html' }
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
                { label: '비밀번호 변경', url: 'mypage-password.html' },
                { label: '발신번호 관리', url: 'mypage-caller-number.html' }
            ]
        }
    };
    
    // 활성 메뉴 매핑 (URL 기반)
    const urlToMenuKey = {
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
        'mypage-password.html': 'mypage',
        'mypage-caller-number.html': 'mypage'
    };
    
    // 현재 페이지 URL에서 활성 메뉴 결정
    if (!activeMenu) {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        activeMenu = urlToMenuKey[currentPage] || 'send';
    }
    
    let navHTML = '';
    
    Object.keys(menuStructure).forEach(key => {
        const menu = menuStructure[key];
        const isActive = activeMenu === key;
        
        if (menu.hasDropdown) {
            const firstItemUrl = menu.items[0]?.url || '#';
            navHTML += `
                <div class="nav-item has-dropdown ${isActive ? 'active' : ''}">
                    <a href="${firstItemUrl}" class="nav-link">${menu.label}</a>
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
                    <a href="send-result.html" style="text-decoration: none; color: inherit;">
                        <h1>Tokbell</h1>
                    </a>
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
                <span class="floating-menu-icon">+</span>
            </button>
            <div class="floating-menu-items" id="floatingMenuItems">
                <a href="message-send-general.html" class="floating-menu-item" title="일반문자 발송">
                    <span class="floating-menu-label">일반문자 발송</span>
                </a>
                <a href="message-send-ad.html" class="floating-menu-item" title="광고문자 발송">
                    <span class="floating-menu-label">광고문자 발송</span>
                </a>
                <a href="message-send-election.html" class="floating-menu-item" title="공직선거문자 발송">
                    <span class="floating-menu-label">공직선거문자 발송</span>
                </a>
                <a href="kakao-send-alimtalk.html" class="floating-menu-item" title="알림톡 발송">
                    <span class="floating-menu-label">알림톡 발송</span>
                </a>
                <a href="kakao-send-brandtalk.html" class="floating-menu-item" title="브랜드톡 발송">
                    <span class="floating-menu-label">브랜드톡 발송</span>
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
                justify-content: flex-end;
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
                justify-content: flex-end;
            }
            
            .floating-menu-item:hover {
                background: var(--primary-color);
                color: white;
                transform: translateX(-4px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
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

