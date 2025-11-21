# FE-M006: PaymentModule 상세 개발 설계서

## 1. 모듈 개요

### 1.1 모듈 식별 정보
- **모듈 ID**: FE-M006
- **모듈명**: PaymentModule (결제 관리 모듈)
- **담당 개발자**: Frontend 개발자
- **예상 개발 기간**: 12일
- **우선순위**: P0

### 1.2 모듈 목적 및 범위
- **핵심 기능**: 
  - 포인트 충전 (발신번호별 금액 분배 지원)
  - 충전/사용 내역 조회
  - 세금계산서 발행
  - 요금 안내
  - 견적 문의
- **비즈니스 가치**: 발송 비용 결제 및 관리, 발신번호별 포인트 관리

### 1.3 목표 사용자
- **주 사용자 그룹**: 개인/기업 회원

---

## 2. 기술 아키텍처

### 2.1 모듈 구조
```
PaymentModule/
├── components/
│   ├── ChargePage.tsx
│   ├── PaymentHistoryPage.tsx
│   ├── TaxInvoicePage.tsx
│   └── PaymentMethodSelect.tsx
├── hooks/
│   ├── usePayment.ts
│   └── usePaymentHistory.ts
└── services/
    └── paymentService.ts
```

### 2.2 기술 스택
- **프레임워크**: Next.js 14+, React 18+
- **상태관리**: TanStack Query
- **PG 연동**: PG사 결제 모듈

---

## 3. 인터페이스 정의

### 3.1 외부 의존성
```typescript
interface ExternalDependencies {
  modules: ['FE-M008: AuthModule', 'FE-M009: CommonUIModule', 'FE-M007: MyPageModule'];
  apis: ['BE-M006: PaymentServiceModule', 'BE-M007: UserServiceModule'];
  sharedComponents: ['Button', 'Input', 'Modal', 'Table'];
  utils: ['COM-M001: APIClientModule'];
}
```

---

## 4. 데이터 모델

### 4.1 엔티티 정의
```typescript
interface Payment {
  id: string;
  userId: string;
  amount: number;
  method: string;
  status: string;
  distributions: CallerNumberDistribution[];
  createdAt: Date;
}

interface CallerNumberDistribution {
  callerNumberId: string;
  callerNumber: string;
  amount: number;
}

interface CallerNumber {
  id: string;
  callerNumber: string;
  ownerName: string;
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
}

interface PaymentHistory {
  id: string;
  type: 'CHARGE' | 'USE' | 'REFUND';
  amount: number;
  balance: number;
  callerNumberId?: string;
  callerNumber?: string;
  callerNumberBalance?: number; // 발신번호별 잔액
  description: string;
  distributions?: CallerNumberDistribution[]; // 충전 시 분배 내역
  createdAt: Date;
}

interface CallerNumberBalance {
  callerNumberId: string;
  callerNumber: string;
  ownerName: string;
  balance: number;
}
```

---

## 5. 핵심 컴포넌트/서비스 명세

### 5.1 주요 컴포넌트

#### ChargePage
```typescript
const ChargePage: React.FC = () => {
  const { charge, isLoading } = usePayment();
  const { callerNumbers } = useCallerNumbers();
  const [amount, setAmount] = useState(50000);
  const [method, setMethod] = useState('CARD');
  const [distributions, setDistributions] = useState<Record<string, number>>({});
  
  // 발신번호별 분배 금액 합계 계산
  const totalDistributed = Object.values(distributions).reduce((sum, val) => sum + (val || 0), 0);
  const isValidDistribution = totalDistributed === amount;
  
  // 균등 분배
  const handleEqualDistribution = () => {
    if (callerNumbers.length === 0) return;
    const equalAmount = Math.floor(amount / callerNumbers.length);
    const remainder = amount % callerNumbers.length;
    const newDistributions: Record<string, number> = {};
    callerNumbers.forEach((cn, index) => {
      newDistributions[cn.id] = equalAmount + (index < remainder ? 1 : 0);
    });
    setDistributions(newDistributions);
  };
  
  const handleCharge = async () => {
    if (!isValidDistribution) {
      alert('분배 금액 합계가 총 충전 금액과 일치하지 않습니다.');
      return;
    }
    
    const distributionList = Object.entries(distributions).map(([id, amt]) => ({
      callerNumberId: id,
      amount: amt
    }));
    
    const result = await charge({ 
      amount, 
      method,
      distributions: distributionList
    });
    if (result.success) {
      // PG 결제 모듈 호출
      // ...
    }
  };
  
  return (
    <div>
      <AmountSelect value={amount} onChange={setAmount} />
      <PaymentMethodSelect value={method} onChange={setMethod} />
      <CallerNumberDistribution
        callerNumbers={callerNumbers}
        distributions={distributions}
        totalAmount={amount}
        onChange={setDistributions}
        onEqualDistribution={handleEqualDistribution}
      />
      {!isValidDistribution && (
        <Alert type="warning">
          분배 금액 합계({formatNumber(totalDistributed)}원)가 총 충전 금액({formatNumber(amount)}원)과 일치하지 않습니다.
        </Alert>
      )}
      <Button onClick={handleCharge} disabled={!isValidDistribution}>
        충전하기
      </Button>
    </div>
  );
};
```

#### CallerNumberDistribution 컴포넌트
```typescript
interface CallerNumberDistributionProps {
  callerNumbers: CallerNumber[];
  distributions: Record<string, number>;
  totalAmount: number;
  onChange: (distributions: Record<string, number>) => void;
  onEqualDistribution: () => void;
}

const CallerNumberDistribution: React.FC<CallerNumberDistributionProps> = ({
  callerNumbers,
  distributions,
  totalAmount,
  onChange,
  onEqualDistribution
}) => {
  const totalDistributed = Object.values(distributions).reduce((sum, val) => sum + (val || 0), 0);
  const difference = totalAmount - totalDistributed;
  
  if (callerNumbers.length === 0) {
    return (
      <Alert type="info">
        등록된 발신번호가 없습니다. 
        <Link href="/mypage/caller-number">발신번호를 먼저 등록해주세요</Link>
      </Alert>
    );
  }
  
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3>발신번호별 금액 분배</h3>
        <Button onClick={onEqualDistribution}>균등 분배</Button>
      </div>
      <Table>
        <thead>
          <tr>
            <th>발신번호</th>
            <th>명의자</th>
            <th>분배 금액</th>
          </tr>
        </thead>
        <tbody>
          {callerNumbers.map(cn => (
            <tr key={cn.id}>
              <td>{cn.callerNumber}</td>
              <td>{cn.ownerName}</td>
              <td>
                <Input
                  type="number"
                  value={distributions[cn.id] || 0}
                  onChange={(e) => {
                    const newDistributions = { ...distributions };
                    newDistributions[cn.id] = parseInt(e.target.value) || 0;
                    onChange(newDistributions);
                  }}
                  min="0"
                />
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={2}>합계</td>
            <td>{formatNumber(totalDistributed)}원</td>
          </tr>
          <tr>
            <td colSpan={2}>차이</td>
            <td style={{ color: difference === 0 ? 'green' : 'red' }}>
              {difference === 0 ? '일치' : `${formatNumber(Math.abs(difference))}원 ${difference > 0 ? '부족' : '초과'}`}
            </td>
          </tr>
        </tfoot>
      </Table>
    </div>
  );
};
```

#### PaymentHistoryPage
```typescript
const PaymentHistoryPage: React.FC = () => {
  const { data: balances } = useQuery<CallerNumberBalance[]>({
    queryKey: ['callerNumberBalances'],
    queryFn: () => paymentService.getCallerNumberBalances()
  });
  
  const { data: histories } = usePaymentHistory();
  const [activeTab, setActiveTab] = useState<'charge' | 'use' | 'refund'>('charge');
  
  const totalBalance = balances?.reduce((sum, b) => sum + b.balance, 0) || 0;
  
  return (
    <div>
      {/* 전체 잔액 및 발신번호별 잔액 */}
      <div className="balance-section">
        <div className="total-balance">
          <h2>잔여포인트</h2>
          <div className="balance-amount">{formatNumber(totalBalance)}원</div>
        </div>
        
        <div className="caller-number-balances">
          <h3>발신번호별 잔액</h3>
          <Table>
            <thead>
              <tr>
                <th>발신번호</th>
                <th>명의자</th>
                <th>잔여포인트</th>
              </tr>
            </thead>
            <tbody>
              {balances?.map(balance => (
                <tr key={balance.callerNumberId}>
                  <td>{balance.callerNumber}</td>
                  <td>{balance.ownerName}</td>
                  <td className={balance.balance <= 0 ? 'warning' : ''}>
                    {formatNumber(balance.balance)}원
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </div>
      
      {/* 탭 메뉴 및 내역 목록 */}
      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tab value="charge">충전내역</Tab>
        <Tab value="use">사용내역</Tab>
        <Tab value="refund">환불내역</Tab>
      </Tabs>
      
      {activeTab === 'charge' && (
        <ChargeHistoryList 
          histories={histories?.filter(h => h.type === 'CHARGE')}
          onViewDistribution={(paymentId) => {
            // 발신번호별 분배 내역 팝업 표시
          }}
        />
      )}
      
      {activeTab === 'use' && (
        <UseHistoryList 
          histories={histories?.filter(h => h.type === 'USE')}
        />
      )}
    </div>
  );
};
```

#### ChargeHistoryList 컴포넌트
```typescript
interface ChargeHistoryListProps {
  histories: PaymentHistory[];
  onViewDistribution: (paymentId: string) => void;
}

const ChargeHistoryList: React.FC<ChargeHistoryListProps> = ({
  histories,
  onViewDistribution
}) => {
  return (
    <Table>
      <thead>
        <tr>
          <th>날짜</th>
          <th>충전금액</th>
          <th>충전방법</th>
          <th>충전상태</th>
          <th>발신번호별 분배</th>
          <th>관리</th>
        </tr>
      </thead>
      <tbody>
        {histories.map(history => (
          <tr key={history.id}>
            <td>{formatDate(history.createdAt)}</td>
            <td>{formatNumber(history.amount)}원</td>
            <td>{history.method}</td>
            <td>{history.status}</td>
            <td>
              {history.distributions && history.distributions.length > 0 ? (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onViewDistribution(history.id)}
                >
                  분배 내역 보기
                </Button>
              ) : (
                '-'
              )}
            </td>
            <td>
              <Button variant="outline" size="sm">영수증</Button>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};
```

#### UseHistoryList 컴포넌트
```typescript
interface UseHistoryListProps {
  histories: PaymentHistory[];
}

const UseHistoryList: React.FC<UseHistoryListProps> = ({ histories }) => {
  return (
    <Table>
      <thead>
        <tr>
          <th>날짜</th>
          <th>제목</th>
          <th>발신번호</th>
          <th>서비스</th>
          <th>사용금액</th>
          <th>발신번호별 잔액</th>
          <th>전체 잔액</th>
          <th>관리</th>
        </tr>
      </thead>
      <tbody>
        {histories.map(history => (
          <tr key={history.id}>
            <td>{formatDate(history.createdAt)}</td>
            <td>{history.description}</td>
            <td>{history.callerNumber || '-'}</td>
            <td>{history.serviceType}</td>
            <td style={{ color: 'red' }}>-{formatNumber(history.amount)}원</td>
            <td>
              {history.callerNumberBalance !== undefined 
                ? `${formatNumber(history.callerNumberBalance)}원`
                : '-'
              }
            </td>
            <td>{formatNumber(history.balance)}원</td>
            <td>
              <Button variant="outline" size="sm">상세보기</Button>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};
```

---

## 6. 에러 처리

### 6.1 에러 코드 정의
```typescript
enum PaymentErrorCode {
  INSUFFICIENT_AMOUNT = 'PAY_001',
  PAYMENT_FAILED = 'PAY_002',
  PG_ERROR = 'PAY_003',
  INVALID_DISTRIBUTION = 'PAY_004',
  NO_CALLER_NUMBER = 'PAY_005',
  DISTRIBUTION_SUM_MISMATCH = 'PAY_006',
}
```

## 7. API 명세

### 7.1 발신번호 목록 조회
```
GET /api/v1/caller-numbers?status=APPROVED

Response:
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "CN_20231201_001",
        "callerNumber": "010-1234-5678",
        "ownerName": "홍길동",
        "status": "APPROVED"
      }
    ]
  }
}
```

### 7.2 충전 요청 (발신번호별 분배 포함)
```
POST /api/v1/payments/charge

Request:
{
  "amount": 100000,
  "method": "CARD",
  "distributions": [
    {
      "callerNumberId": "CN_20231201_001",
      "amount": 30000
    },
    {
      "callerNumberId": "CN_20231201_002",
      "amount": 50000
    },
    {
      "callerNumberId": "CN_20231201_003",
      "amount": 20000
    }
  ]
}

Response:
{
  "success": true,
  "data": {
    "paymentId": "PAY_20231201_001",
    "amount": 100000,
    "distributions": [...],
    "status": "COMPLETED"
  }
}
```

### 7.3 발신번호별 잔액 조회
```
GET /api/v1/payments/caller-number-balances

Response:
{
  "success": true,
  "data": {
    "items": [
      {
        "callerNumberId": "CN_20231201_001",
        "callerNumber": "010-1234-5678",
        "ownerName": "홍길동",
        "balance": 30000
      },
      {
        "callerNumberId": "CN_20231201_002",
        "callerNumber": "010-2345-6789",
        "ownerName": "김철수",
        "balance": 50000
      }
    ],
    "totalBalance": 80000
  }
}
```

### 7.4 충전/사용 내역 조회
```
GET /api/v1/payments/history?startDate=2024-01-01&endDate=2024-12-31&type=CHARGE

Response:
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "PH_001",
        "type": "CHARGE",
        "amount": 100000,
        "balance": 100000,
        "method": "CARD",
        "status": "COMPLETED",
        "distributions": [
          {
            "callerNumberId": "CN_20231201_001",
            "callerNumber": "010-1234-5678",
            "amount": 30000
          }
        ],
        "createdAt": "2024-11-19T14:30:00Z"
      }
    ],
    "pagination": {
      "total": 10,
      "page": 1,
      "size": 20
    }
  }
}
```

---

**문서 버전**: 1.0  
**작성일**: 2024-11-19

