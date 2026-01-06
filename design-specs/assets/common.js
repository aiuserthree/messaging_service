// 톡벨 화면설계서 공통 JavaScript

// Marker & Description Interaction
function initMarkerInteraction() {
    const markers = document.querySelectorAll('.marker');
    const descItems = document.querySelectorAll('.desc-item');

    function activateItem(id) {
        // Reset all
        markers.forEach(m => m.classList.remove('active'));
        descItems.forEach(d => d.classList.remove('active'));

        // Activate selected
        const marker = document.querySelector(`.marker[data-id="${id}"]`);
        const descItem = document.querySelector(`.desc-item[data-id="${id}"]`);
        
        if (marker) marker.classList.add('active');
        if (descItem) {
            descItem.classList.add('active');
            descItem.classList.add('expanded');
            descItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }

    markers.forEach(marker => {
        marker.addEventListener('click', () => {
            activateItem(marker.dataset.id);
        });
    });

    descItems.forEach(item => {
        item.querySelector('.desc-item-header').addEventListener('click', () => {
            const id = item.dataset.id;
            
            // Toggle expansion
            if (item.classList.contains('expanded')) {
                item.classList.remove('expanded');
            } else {
                item.classList.add('expanded');
            }
            
            activateItem(id);
        });
    });

    // Initialize first item as active
    if (descItems.length > 0) {
        activateItem('1');
    }
}

// Zoom Controls
function initZoomControls() {
    let zoomLevel = 100;
    const mockupCanvas = document.querySelector('.mockup-canvas');
    const zoomLevelDisplay = document.getElementById('zoomLevel');
    const zoomInBtn = document.getElementById('zoomIn');
    const zoomOutBtn = document.getElementById('zoomOut');
    const zoomResetBtn = document.getElementById('zoomReset');

    if (!mockupCanvas || !zoomLevelDisplay) return;

    function updateZoom() {
        mockupCanvas.style.transform = `scale(${zoomLevel / 100})`;
        mockupCanvas.style.transformOrigin = 'top center';
        zoomLevelDisplay.textContent = `${zoomLevel}%`;
    }

    if (zoomInBtn) {
        zoomInBtn.addEventListener('click', () => {
            if (zoomLevel < 150) {
                zoomLevel += 10;
                updateZoom();
            }
        });
    }

    if (zoomOutBtn) {
        zoomOutBtn.addEventListener('click', () => {
            if (zoomLevel > 50) {
                zoomLevel -= 10;
                updateZoom();
            }
        });
    }

    if (zoomResetBtn) {
        zoomResetBtn.addEventListener('click', () => {
            zoomLevel = 100;
            updateZoom();
        });
    }

    // Mouse wheel zoom
    mockupCanvas.addEventListener('wheel', (e) => {
        if (e.ctrlKey) {
            e.preventDefault();
            if (e.deltaY < 0 && zoomLevel < 150) {
                zoomLevel += 5;
            } else if (e.deltaY > 0 && zoomLevel > 50) {
                zoomLevel -= 5;
            }
            updateZoom();
        }
    });
}

// View Toggle Controls (Modal Show/Hide)
function initViewToggle() {
    const toggleBtns = document.querySelectorAll('.view-toggle-btn');
    const modalContainer = document.querySelector('.modal-container');
    const viewStateBadge = document.querySelector('.view-state-badge');
    
    if (!toggleBtns.length || !modalContainer) return;

    toggleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const view = btn.dataset.view;
            
            // Update button states
            toggleBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Show/hide modal
            if (view === 'modal') {
                modalContainer.classList.add('visible');
                if (viewStateBadge) {
                    viewStateBadge.textContent = '';
                    viewStateBadge.innerHTML = '<span class="dot"></span> 모달 팝업 보기';
                }
            } else {
                modalContainer.classList.remove('visible');
                if (viewStateBadge) {
                    viewStateBadge.textContent = '';
                    viewStateBadge.innerHTML = '<span class="dot"></span> 바닥 페이지 보기';
                }
            }
        });
    });
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    initMarkerInteraction();
    initZoomControls();
    initViewToggle();
});
