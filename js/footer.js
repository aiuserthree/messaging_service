// 공통 푸터 생성 함수
function createFooter() {
    return `
        <footer class="footer">
            <div class="footer-content">
                <div class="footer-section">
                    <h4 class="footer-title">고객센터</h4>
                    <div class="footer-info">
                        <p class="footer-text">전화: 1588-5412</p>
                        <p class="footer-text">이메일: support@tokbell.com</p>
                        <p class="footer-text">운영시간: 평일 09:00 ~ 18:00</p>
                    </div>
                </div>
                <div class="footer-section">
                    <h4 class="footer-title">회사정보</h4>
                    <div class="footer-info">
                        <p class="footer-text">상호: (주)톡벨</p>
                        <p class="footer-text">대표자: 정용관</p>
                        <p class="footer-text">사업자등록번호: 116-81-68774</p>
                        <p class="footer-text">통신판매업신고번호: 제2025-서울-0000호</p>
                        <p class="footer-text">주소: 서울 강서구 마곡동 779번지 보타닉게이트 10층</p>
                    </div>
                </div>
                <div class="footer-section">
                    <h4 class="footer-title">정책</h4>
                    <div class="footer-links">
                        <a href="javascript:void(0)" class="footer-link" onclick="event.preventDefault(); openPolicyModal('company')">회사소개</a>
                        <a href="javascript:void(0)" class="footer-link" onclick="event.preventDefault(); openPolicyModal('terms')">이용약관</a>
                        <a href="javascript:void(0)" class="footer-link" onclick="event.preventDefault(); openPolicyModal('privacy')">개인정보처리방침</a>
                        <a href="javascript:void(0)" class="footer-link" onclick="event.preventDefault(); openPolicyModal('refund')">환불정책</a>
                    </div>
                </div>
            </div>
            <div class="footer-bottom">
                <p class="footer-copyright">© 2025 Tokbell. All rights reserved.</p>
            </div>
        </footer>
        <style>
            .footer {
                background-color: var(--text-primary);
                color: var(--surface-color);
                padding: 48px 24px 24px;
                margin-top: 64px;
            }
            .footer-content {
                max-width: 1400px;
                margin: 0 auto;
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 32px;
                margin-bottom: 32px;
            }
            .footer-section {
                display: flex;
                flex-direction: column;
            }
            .footer-title {
                font-size: 16px;
                font-weight: 600;
                margin-bottom: 16px;
                color: var(--surface-color);
            }
            .footer-info {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }
            .footer-text {
                font-size: 13px;
                color: rgba(255, 255, 255, 0.8);
                line-height: 1.6;
                margin: 0;
            }
            .footer-links {
                display: flex;
                flex-direction: column;
                gap: 12px;
            }
            .footer-link {
                font-size: 13px;
                color: rgba(255, 255, 255, 0.8);
                text-decoration: none;
                transition: color 0.2s;
            }
            .footer-link:hover {
                color: var(--surface-color);
                text-decoration: underline;
            }
            .footer-bottom {
                max-width: 1400px;
                margin: 0 auto;
                padding-top: 24px;
                border-top: 1px solid rgba(255, 255, 255, 0.1);
                text-align: center;
            }
            .footer-copyright {
                font-size: 12px;
                color: rgba(255, 255, 255, 0.6);
                margin: 0;
            }
            @media (max-width: 768px) {
                .footer {
                    padding: 32px 16px 16px;
                }
                .footer-content {
                    grid-template-columns: 1fr;
                    gap: 24px;
                }
            }
        </style>
    `;
}

// 모달 열기 함수
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

// 모달 닫기 함수
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
}

// 정책 모달 열기 함수
function openPolicyModal(type) {
    const modalId = 'policyModal';
    let modal = document.getElementById(modalId);
    
    if (!modal) {
        modal = document.createElement('div');
        modal.id = modalId;
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal" style="max-width: 800px; max-height: 90vh; overflow-y: auto;">
                <div class="modal-header">
                    <h3 class="modal-title" id="policyModalTitle">정책</h3>
                    <button class="modal-close" onclick="closeModal('policyModal')">&times;</button>
                </div>
                <div class="modal-body" id="policyModalBody">
                    <p>내용을 불러오는 중...</p>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-outline" onclick="closeModal('policyModal')">닫기</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        // 모달 외부 클릭 시 닫기
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal(modalId);
            }
        });
    }
    
    const titleMap = {
        'company': '회사소개',
        'terms': '이용약관',
        'privacy': '개인정보처리방침',
        'refund': '환불정책'
    };
    
    const contentMap = {
        'company': `
            <h3 style="margin-bottom: 16px;">회사소개</h3>
            <div style="line-height: 1.8; color: var(--text-primary);">
                <p style="margin-bottom: 16px;">
                    <strong>(주)톡벨</strong>은 기업과 개인을 위한 차세대 메시징 서비스 플랫폼을 제공하는 전문 기업입니다.
                    고객과의 소통을 혁신하고, 비즈니스 성장을 지원하는 신뢰할 수 있는 파트너로서 최고의 메시징 솔루션을 제공합니다.
                </p>
                
                <h4 style="margin-top: 24px; margin-bottom: 12px;">주요 서비스</h4>
                <ul style="padding-left: 20px; margin-bottom: 16px;">
                    <li style="margin-bottom: 8px;"><strong>문자 발송 서비스</strong>: SMS(단문), LMS(장문), MMS(멀티미디어) 발송 지원으로 다양한 메시지 형태 제공</li>
                    <li style="margin-bottom: 8px;"><strong>카카오톡 발송 서비스</strong>: 알림톡, 브랜드톡을 통한 고객 맞춤형 메시지 발송</li>
                    <li style="margin-bottom: 8px;"><strong>템플릿 관리</strong>: 문자, 알림톡, 브랜드톡 템플릿 등록 및 관리로 효율적인 메시지 발송</li>
                    <li style="margin-bottom: 8px;"><strong>발송 관리</strong>: 발송 결과 조회, 예약 발송, 대량 발송 등 체계적인 발송 관리 시스템</li>
                    <li style="margin-bottom: 8px;"><strong>주소록 관리</strong>: 고객 정보 체계적 관리, 그룹별 분류 및 엑셀 업로드 지원</li>
                    <li style="margin-bottom: 8px;"><strong>수신거부 관리</strong>: 수신거부 번호 자동 관리로 법적 규정 준수 및 고객 만족도 향상</li>
                </ul>
                
                <h4 style="margin-top: 24px; margin-bottom: 12px;">핵심 가치</h4>
                <ul style="padding-left: 20px; margin-bottom: 16px;">
                    <li style="margin-bottom: 8px;"><strong>신뢰성</strong>: 안정적인 인프라와 99.9% 이상의 발송 성공률 보장</li>
                    <li style="margin-bottom: 8px;"><strong>혁신성</strong>: 최신 기술을 활용한 사용자 친화적인 플랫폼 제공</li>
                    <li style="margin-bottom: 8px;"><strong>고객 중심</strong>: 고객의 니즈를 반영한 지속적인 서비스 개선</li>
                    <li style="margin-bottom: 8px;"><strong>법적 준수</strong>: 정보통신망법, 개인정보보호법 등 관련 법규 준수</li>
                </ul>
                
                <h4 style="margin-top: 24px; margin-bottom: 12px;">주요 특징</h4>
                <ul style="padding-left: 20px; margin-bottom: 16px;">
                    <li style="margin-bottom: 8px;">실시간 발송 현황 모니터링 및 상세한 발송 결과 분석 제공</li>
                    <li style="margin-bottom: 8px;">직관적이고 사용하기 쉬운 웹 기반 관리 시스템</li>
                    <li style="margin-bottom: 8px;">유연한 요금제 및 디파짓 기반 충전 시스템</li>
                    <li style="margin-bottom: 8px;">발신번호 등록 및 관리로 신뢰성 있는 메시지 발송</li>
                    <li style="margin-bottom: 8px;">24시간 안정적인 서비스 운영 및 기술 지원</li>
                </ul>
                
                <h4 style="margin-top: 24px; margin-bottom: 12px;">연혁</h4>
                <ul style="padding-left: 20px; margin-bottom: 16px;">
                    <li style="margin-bottom: 8px;"><strong>2025년 1월</strong>: 톡벨 서비스 런칭 및 정식 오픈</li>
                    <li style="margin-bottom: 8px;"><strong>2025년 2월</strong>: 안정적인 메시징 인프라 구축 완료</li>
                    <li style="margin-bottom: 8px;"><strong>2025년 3월</strong>: 다양한 기업 고객 서비스 제공 시작</li>
                    <li style="margin-bottom: 8px;"><strong>2025년 4월</strong>: 카카오톡 발송 서비스 확대 및 고도화</li>
                </ul>
                
                <h4 style="margin-top: 24px; margin-bottom: 12px;">미션</h4>
                <p style="margin-bottom: 16px;">
                    톡벨은 고객과의 소통을 더욱 쉽고 효율적으로 만들어가는 것을 핵심 미션으로 합니다.
                    기업의 마케팅, 고객 관리, 공지사항 전달 등 다양한 비즈니스 니즈를 충족시키는 
                    종합 메시징 솔루션을 제공하여 고객의 성공을 함께 만들어갑니다.
                </p>
                
                <h4 style="margin-top: 24px; margin-bottom: 12px;">비전</h4>
                <p>
                    톡벨은 국내 최고의 메시징 서비스 플랫폼으로 성장하여, 
                    모든 기업과 개인이 쉽고 편리하게 메시지를 발송할 수 있는 생태계를 구축하겠습니다.
                    지속적인 기술 혁신과 고객 만족을 통해 신뢰받는 메시징 파트너가 되겠습니다.
                </p>
            </div>
        `,
        'terms': `
            <h3 style="margin-bottom: 16px;">이용약관</h3>
            <div style="line-height: 1.8; color: var(--text-primary);">
                <p style="margin-bottom: 16px;"><strong>제1조 (목적)</strong></p>
                <p style="margin-bottom: 24px; padding-left: 16px;">
                    이 약관은 (주)톡벨(이하 "회사")이 제공하는 메시징 서비스의 이용과 관련하여 회사와 이용자 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
                </p>
                
                <p style="margin-bottom: 16px;"><strong>제2조 (정의)</strong></p>
                <ul style="padding-left: 20px; margin-bottom: 24px;">
                    <li>"서비스"란 회사가 제공하는 문자 발송, 카카오톡 발송 등 모든 메시징 서비스를 의미합니다.</li>
                    <li>"이용자"란 이 약관에 따라 회사가 제공하는 서비스를 받는 개인 또는 법인을 의미합니다.</li>
                    <li>"포인트"란 서비스 이용을 위해 충전한 금액을 의미합니다.</li>
                </ul>
                
                <p style="margin-bottom: 16px;"><strong>제3조 (서비스의 제공)</strong></p>
                <ul style="padding-left: 20px; margin-bottom: 24px;">
                    <li>회사는 이용자에게 문자 발송 서비스(SMS, LMS, MMS)를 제공합니다.</li>
                    <li>회사는 이용자에게 카카오톡 발송 서비스(알림톡, 브랜드톡)를 제공합니다.</li>
                    <li>회사는 이용자에게 템플릿 관리, 주소록 관리 등 부가 서비스를 제공합니다.</li>
                </ul>
                
                <p style="margin-bottom: 16px;"><strong>제4조 (이용자의 의무)</strong></p>
                <ul style="padding-left: 20px; margin-bottom: 24px;">
                    <li>이용자는 관련 법령 및 이 약관을 준수하여야 합니다.</li>
                    <li>이용자는 광고성 메시지 발송 시 관련 법령을 준수하여야 합니다.</li>
                    <li>이용자는 타인의 정보를 무단으로 수집하거나 이용하여서는 안 됩니다.</li>
                </ul>
                
                <p style="margin-bottom: 16px;"><strong>제5조 (서비스 이용 요금)</strong></p>
                <ul style="padding-left: 20px; margin-bottom: 24px;">
                    <li>서비스 이용 요금은 회사가 정한 요금표에 따릅니다.</li>
                    <li>이용자는 포인트를 충전하여 서비스를 이용할 수 있습니다.</li>
                    <li>포인트는 사용 후 환불이 불가능하며, 유효기간이 있을 수 있습니다.</li>
                </ul>
                
                <p style="margin-bottom: 16px;"><strong>제6조 (면책사항)</strong></p>
                <p style="margin-bottom: 24px; padding-left: 16px;">
                    회사는 천재지변, 전쟁, 기간통신사업자의 서비스 중지 등 불가항력으로 인한 서비스 중단에 대해 책임을 지지 않습니다.
                </p>
                
                <p style="margin-bottom: 16px;"><strong>제7조 (약관의 변경)</strong></p>
                <p style="padding-left: 16px;">
                    회사는 필요한 경우 이 약관을 변경할 수 있으며, 변경 시 서비스 내 공지사항을 통해 안내합니다.
                </p>
            </div>
        `,
        'privacy': `
            <h3 style="margin-bottom: 16px;">개인정보처리방침</h3>
            <div style="line-height: 1.8; color: var(--text-primary);">
                <p style="margin-bottom: 16px;"><strong>제1조 (개인정보의 처리 목적)</strong></p>
                <p style="margin-bottom: 24px; padding-left: 16px;">
                    (주)톡벨은 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 개인정보 보호법 제18조에 따라 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.
                </p>
                <ul style="padding-left: 20px; margin-bottom: 24px;">
                    <li>서비스 제공: 메시징 서비스 제공, 본인인증, 서비스 이용에 따른 요금 정산</li>
                    <li>회원 관리: 회원 가입, 회원 식별, 부정 이용 방지, 고객 문의 응대</li>
                    <li>마케팅 및 광고: 신규 서비스 안내, 이벤트 정보 제공</li>
                </ul>
                
                <p style="margin-bottom: 16px;"><strong>제2조 (개인정보의 처리 및 보유기간)</strong></p>
                <ul style="padding-left: 20px; margin-bottom: 24px;">
                    <li>회원 정보: 회원 탈퇴 시까지 (단, 관련 법령에 따라 보존이 필요한 경우 해당 기간 동안 보관)</li>
                    <li>거래 정보: 전자상거래법에 따라 5년간 보관</li>
                    <li>계약 또는 청약철회 등에 관한 기록: 5년</li>
                    <li>대금결제 및 재화 등의 공급에 관한 기록: 5년</li>
                </ul>
                
                <p style="margin-bottom: 16px;"><strong>제3조 (처리하는 개인정보의 항목)</strong></p>
                <p style="margin-bottom: 12px; padding-left: 16px;">회사는 다음의 개인정보 항목을 처리하고 있습니다:</p>
                <ul style="padding-left: 20px; margin-bottom: 24px;">
                    <li>필수항목: 이름, 이메일, 전화번호, 비밀번호</li>
                    <li>선택항목: 회사명, 부서명, 직책</li>
                    <li>자동 수집 항목: IP주소, 쿠키, 서비스 이용 기록</li>
                </ul>
                
                <p style="margin-bottom: 16px;"><strong>제4조 (개인정보의 제3자 제공)</strong></p>
                <p style="margin-bottom: 24px; padding-left: 16px;">
                    회사는 원칙적으로 이용자의 개인정보를 제3자에게 제공하지 않습니다. 다만, 다음의 경우에는 예외로 합니다:
                </p>
                <ul style="padding-left: 20px; margin-bottom: 24px;">
                    <li>이용자가 사전에 동의한 경우</li>
                    <li>법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우</li>
                </ul>
                
                <p style="margin-bottom: 16px;"><strong>제5조 (개인정보처리의 위탁)</strong></p>
                <p style="margin-bottom: 24px; padding-left: 16px;">
                    회사는 서비스 향상을 위해 다음과 같이 개인정보 처리업무를 외부 전문업체에 위탁하여 운영할 수 있습니다:
                </p>
                <ul style="padding-left: 20px; margin-bottom: 24px;">
                    <li>메시지 발송 업체: 문자 및 카카오톡 메시지 발송 처리</li>
                    <li>결제 대행 업체: 신용카드 및 계좌이체 결제 처리</li>
                </ul>
                
                <p style="margin-bottom: 16px;"><strong>제6조 (정보주체의 권리·의무 및 그 행사방법)</strong></p>
                <ul style="padding-left: 20px; margin-bottom: 24px;">
                    <li>이용자는 언제든지 개인정보 열람·정정·삭제·처리정지 요구 등의 권리를 행사할 수 있습니다.</li>
                    <li>권리 행사는 회사에 대해 서면, 전자우편, 모사전송(FAX) 등을 통하여 하실 수 있으며 회사는 이에 대해 지체 없이 조치하겠습니다.</li>
                </ul>
                
                <p style="margin-bottom: 16px;"><strong>제7조 (개인정보의 파기)</strong></p>
                <p style="margin-bottom: 24px; padding-left: 16px;">
                    회사는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는 지체없이 해당 개인정보를 파기합니다.
                </p>
                
                <p style="margin-bottom: 16px;"><strong>제8조 (개인정보 보호책임자)</strong></p>
                <p style="padding-left: 16px;">
                    회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 정보주체의 불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.<br><br>
                    <strong>개인정보 보호책임자</strong><br>
                    성명: 홍길동<br>
                    직책: 개인정보보호팀장<br>
                    연락처: 1588-5412, privacy@tokbell.com
                </p>
            </div>
        `,
        'refund': `
            <h3 style="margin-bottom: 16px;">환불정책</h3>
            <div style="line-height: 1.8; color: var(--text-primary);">
                <p style="margin-bottom: 16px;"><strong>제1조 (환불 대상)</strong></p>
                <ul style="padding-left: 20px; margin-bottom: 24px;">
                    <li>미사용 포인트에 대해서는 환불이 가능합니다.</li>
                    <li>이미 사용된 포인트는 환불 대상이 아닙니다.</li>
                    <li>무통장입금으로 충전한 금액 중 미사용 금액은 환불 가능합니다.</li>
                </ul>
                
                <p style="margin-bottom: 16px;"><strong>제2조 (환불 절차)</strong></p>
                <ol style="padding-left: 20px; margin-bottom: 24px;">
                    <li>환불 신청: 고객센터(1588-5412) 또는 이메일(support@tokbell.com)로 환불 신청</li>
                    <li>환불 검토: 신청일로부터 영업일 기준 3일 이내 환불 검토</li>
                    <li>환불 처리: 검토 완료 후 영업일 기준 5일 이내 환불 처리</li>
                </ol>
                
                <p style="margin-bottom: 16px;"><strong>제3조 (환불 방법)</strong></p>
                <ul style="padding-left: 20px; margin-bottom: 24px;">
                    <li>신용카드 결제: 결제 취소 처리 (영업일 기준 3~5일 소요)</li>
                    <li>무통장입금: 입금하신 계좌로 환불 (영업일 기준 3~5일 소요)</li>
                    <li>계좌이체: 입금하신 계좌로 환불 (영업일 기준 1~3일 소요)</li>
                </ul>
                
                <p style="margin-bottom: 16px;"><strong>제4조 (환불 수수료)</strong></p>
                <ul style="padding-left: 20px; margin-bottom: 24px;">
                    <li>충전 후 7일 이내 환불: 수수료 없음</li>
                    <li>충전 후 7일 이후 환불: 환불 금액의 10% 수수료 차감</li>
                    <li>부분 환불 시에도 동일한 수수료 정책이 적용됩니다.</li>
                </ul>
                
                <p style="margin-bottom: 16px;"><strong>제5조 (환불 불가 사항)</strong></p>
                <ul style="padding-left: 20px; margin-bottom: 24px;">
                    <li>이미 발송된 메시지에 사용된 포인트</li>
                    <li>프로모션으로 지급된 무료 포인트</li>
                    <li>이벤트 참여로 지급된 보너스 포인트</li>
                    <li>계약 해지 시 잔여 포인트가 10,000원 미만인 경우</li>
                </ul>
                
                <p style="margin-bottom: 16px;"><strong>제6조 (환불 문의)</strong></p>
                <p style="padding-left: 16px;">
                    환불 관련 문의사항은 고객센터(1588-5412) 또는 이메일(support@tokbell.com)로 연락 주시기 바랍니다.<br>
                    운영시간: 평일 09:00 ~ 18:00
                </p>
            </div>
        `
    };
    
    document.getElementById('policyModalTitle').textContent = titleMap[type] || '정책';
    document.getElementById('policyModalBody').innerHTML = contentMap[type] || '<p>내용이 없습니다.</p>';
    
    openModal('policyModal');
}

// 모달 스타일 추가
(function() {
    if (!document.getElementById('footer-modal-styles')) {
        const style = document.createElement('style');
        style.id = 'footer-modal-styles';
        style.textContent = `
            .modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-color: rgba(0, 0, 0, 0.5);
                display: none;
                align-items: center;
                justify-content: center;
                z-index: 1000;
            }
            .modal-overlay.active {
                display: flex;
            }
            .modal {
                background-color: var(--surface-color, #ffffff);
                border-radius: 12px;
                box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
                max-width: 600px;
                width: 90%;
                max-height: 90vh;
                overflow-y: auto;
            }
            .modal-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 20px 24px;
                border-bottom: 1px solid var(--border-color, #e2e8f0);
            }
            .modal-title {
                font-size: 18px;
                font-weight: 600;
                color: var(--text-primary, #1e293b);
                margin: 0;
            }
            .modal-close {
                background: none;
                border: none;
                font-size: 28px;
                color: var(--text-secondary, #64748b);
                cursor: pointer;
                padding: 0;
                width: 32px;
                height: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 4px;
                transition: all 0.2s;
            }
            .modal-close:hover {
                background-color: var(--bg-color, #f8fafc);
                color: var(--text-primary, #1e293b);
            }
            .modal-body {
                padding: 24px;
                color: var(--text-primary, #1e293b);
            }
            .modal-footer {
                display: flex;
                justify-content: flex-end;
                gap: 12px;
                padding: 20px 24px;
                border-top: 1px solid var(--border-color, #e2e8f0);
            }
            .btn {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                padding: 10px 20px;
                font-size: 14px;
                font-weight: 500;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.2s;
                text-decoration: none;
            }
            .btn-outline {
                background-color: transparent;
                border: 1px solid var(--border-color, #e2e8f0);
                color: var(--text-primary, #1e293b);
            }
            .btn-outline:hover {
                background-color: var(--bg-color, #f8fafc);
            }
        `;
        document.head.appendChild(style);
    }
    
    // ESC 키로 모달 닫기
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const activeModal = document.querySelector('.modal-overlay.active');
            if (activeModal) {
                const modalId = activeModal.id;
                closeModal(modalId);
            }
        }
    });
})();

