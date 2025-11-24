// 공통 JavaScript 함수

// 모달 열기/닫기
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex'; // 인라인 스타일 제거 후 다시 설정
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
}

// ESC 키로 모달 닫기
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const activeModal = document.querySelector('.modal-overlay.active');
        if (activeModal) {
            activeModal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }
});

// 모달 외부 클릭 시 닫기
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal-overlay')) {
        e.target.classList.remove('active');
        document.body.style.overflow = '';
    }
});

// 탭 전환
function switchTab(tabId, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // 모든 탭 비활성화
    container.querySelectorAll('.tab-item').forEach(tab => {
        tab.classList.remove('active');
    });
    container.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });

    // 선택한 탭 활성화
    const tab = document.querySelector(`[data-tab="${tabId}"]`);
    const content = document.getElementById(tabId);
    if (tab) tab.classList.add('active');
    if (content) content.classList.add('active');
}

// 전화번호 포맷팅
function formatPhoneNumber(value) {
    const numbers = value.replace(/[^\d]/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
}

// 바이트 계산 (한글 3바이트, 영문/숫자 1바이트)
function calculateByteLength(str) {
    let byteLength = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charAt(i);
        if (escape(char).length > 4) {
            byteLength += 3; // 한글
        } else {
            byteLength += 1; // 영문/숫자
        }
    }
    return byteLength;
}

// 토스트 메시지
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 24px;
        background-color: var(--surface-color);
        border: 1px solid var(--border-color);
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-lg);
        z-index: 2000;
        animation: slideIn 0.3s ease;
    `;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// 날짜 포맷팅
function formatDate(date, format = 'YYYY-MM-DD HH:mm') {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');

    return format
        .replace('YYYY', year)
        .replace('MM', month)
        .replace('DD', day)
        .replace('HH', hours)
        .replace('mm', minutes);
}

// 숫자 포맷팅 (천단위 콤마)
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// 파일 업로드 미리보기
function previewFile(input, previewId) {
    const file = input.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const preview = document.getElementById(previewId);
        if (preview) {
            if (file.type.startsWith('image/')) {
                preview.innerHTML = `<img src="${e.target.result}" style="max-width: 100%; max-height: 200px;">`;
            } else {
                preview.textContent = file.name;
            }
        }
    };
    reader.readAsDataURL(file);
}

// 드래그 앤 드롭
function setupDragAndDrop(dropZone, callback) {
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('drag-over');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        const files = e.dataTransfer.files;
        if (files.length > 0 && callback) {
            callback(files[0]);
        }
    });
}

// 페이지네이션
function createPagination(currentPage, totalPages, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    let html = '<div class="pagination">';
    
    // 이전 버튼
    if (currentPage > 1) {
        html += `<button class="page-btn" onclick="goToPage(${currentPage - 1})">이전</button>`;
    }

    // 페이지 번호
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);

    if (startPage > 1) {
        html += `<button class="page-btn" onclick="goToPage(1)">1</button>`;
        if (startPage > 2) html += '<span class="page-ellipsis">...</span>';
    }

    for (let i = startPage; i <= endPage; i++) {
        html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="goToPage(${i})">${i}</button>`;
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) html += '<span class="page-ellipsis">...</span>';
        html += `<button class="page-btn" onclick="goToPage(${totalPages})">${totalPages}</button>`;
    }

    // 다음 버튼
    if (currentPage < totalPages) {
        html += `<button class="page-btn" onclick="goToPage(${currentPage + 1})">다음</button>`;
    }

    html += '</div>';
    container.innerHTML = html;
}

// CSS 애니메이션 추가
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    .drag-over {
        border-color: var(--primary-color) !important;
        background-color: rgba(37, 99, 235, 0.05) !important;
    }
    .pagination {
        display: flex;
        gap: 8px;
        justify-content: center;
        align-items: center;
        margin-top: 24px;
    }
    .page-btn {
        padding: 8px 12px;
        border: 1px solid var(--border-color);
        background-color: var(--surface-color);
        border-radius: var(--radius-md);
        cursor: pointer;
        transition: all 0.2s;
    }
    .page-btn:hover {
        background-color: var(--bg-color);
    }
    .page-btn.active {
        background-color: var(--primary-color);
        color: white;
        border-color: var(--primary-color);
    }
    .page-ellipsis {
        padding: 8px 4px;
    }
`;
document.head.appendChild(style);

// 드롭다운 메뉴 초기화
document.addEventListener('DOMContentLoaded', function() {
    initDropdownMenus();
});

// initDropdownMenus 함수는 header.js에서 제공됩니다

