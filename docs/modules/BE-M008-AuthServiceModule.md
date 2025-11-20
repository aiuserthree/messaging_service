# BE-M008: AuthServiceModule 상세 개발 설계서

## 1. 모듈 개요

### 1.1 모듈 식별 정보
- **모듈 ID**: BE-M008
- **모듈명**: AuthServiceModule (인증/인가 서비스 모듈)
- **담당 개발자**: Backend 개발자
- **예상 개발 기간**: 10일
- **우선순위**: P0

### 1.2 모듈 목적 및 범위
- **핵심 기능**: 
  - 로그인/로그아웃
  - 회원가입
  - JWT 토큰 발급/검증
  - 비밀번호 암호화
  - 세션 관리
- **비즈니스 가치**: 모든 API의 인증/인가 기반 제공

### 1.3 목표 사용자
- **주 사용자 그룹**: Frontend 모듈 (FE-M008)

---

## 2. 기술 아키텍처

### 2.1 모듈 구조
```
AuthServiceModule/
├── controllers/
│   └── auth.controller.ts
├── services/
│   ├── auth.service.ts
│   ├── jwt.service.ts
│   └── password.service.ts
├── guards/
│   ├── jwt-auth.guard.ts
│   └── roles.guard.ts
├── strategies/
│   └── jwt.strategy.ts
└── entities/
    └── user.entity.ts
```

### 2.2 기술 스택
- **프레임워크**: NestJS 10+
- **인증**: Passport, JWT
- **암호화**: bcrypt
- **데이터베이스**: PostgreSQL, Prisma ORM

---

## 3. 인터페이스 정의

### 3.1 외부 의존성
```typescript
interface ExternalDependencies {
  modules: ['BE-M007: UserServiceModule'];
  apis: [];
  sharedComponents: [];
  utils: [];
}
```

### 3.2 제공 인터페이스
```typescript
export interface AuthServiceInterface {
  services: {
    AuthService: {
      login: (credentials: LoginDTO) => Promise<LoginResponse>;
      register: (data: RegisterDTO) => Promise<RegisterResponse>;
      validateToken: (token: string) => Promise<User>;
      refreshToken: (refreshToken: string) => Promise<TokenResponse>;
    };
    
    JWTService: {
      generateToken: (user: User) => string;
      verifyToken: (token: string) => JwtPayload;
      generateRefreshToken: (user: User) => string;
    };
  };
}
```

---

## 4. 데이터 모델

### 4.1 엔티티 정의
```typescript
model User {
  id            String   @id @default(uuid())
  email         String   @unique
  password      String
  name          String
  memberType    String   // PERSONAL, BUSINESS
  balance       Decimal  @default(0)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  @@index([email])
}
```

---

## 5. 핵심 컴포넌트/서비스 명세

### 5.1 주요 서비스

#### AuthService
```typescript
@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JWTService,
    private readonly passwordService: PasswordService,
  ) {}
  
  async login(credentials: LoginDTO): Promise<LoginResponse> {
    const user = await this.userService.findByEmail(credentials.email);
    
    if (!user) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 올바르지 않습니다.');
    }
    
    const isPasswordValid = await this.passwordService.compare(
      credentials.password,
      user.password
    );
    
    if (!isPasswordValid) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 올바르지 않습니다.');
    }
    
    const token = this.jwtService.generateToken(user);
    const refreshToken = this.jwtService.generateRefreshToken(user);
    
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        memberType: user.memberType,
        balance: user.balance,
      },
      token,
      refreshToken,
    };
  }
  
  async register(data: RegisterDTO): Promise<RegisterResponse> {
    // 이메일 중복 확인
    const existing = await this.userService.findByEmail(data.email);
    if (existing) {
      throw new ConflictException('이미 사용 중인 이메일입니다.');
    }
    
    // 비밀번호 암호화
    const hashedPassword = await this.passwordService.hash(data.password);
    
    // 사용자 생성
    const user = await this.userService.create({
      ...data,
      password: hashedPassword,
    });
    
    const token = this.jwtService.generateToken(user);
    
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        memberType: user.memberType,
        balance: user.balance,
      },
      token,
    };
  }
  
  async validateToken(token: string): Promise<User> {
    try {
      const payload = this.jwtService.verifyToken(token);
      const user = await this.userService.findById(payload.sub);
      
      if (!user) {
        throw new UnauthorizedException('사용자를 찾을 수 없습니다.');
      }
      
      return user;
    } catch (error) {
      throw new UnauthorizedException('유효하지 않은 토큰입니다.');
    }
  }
}
```

#### JWT Guard
```typescript
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }
  
  handleRequest(err: any, user: any) {
    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    return user;
  }
}
```

---

## 6. 이벤트 및 메시징

### 6.1 발행 이벤트
```typescript
enum AuthEvents {
  USER_REGISTERED = 'auth.user.registered',
  USER_LOGGED_IN = 'auth.user.logged_in',
  TOKEN_REFRESHED = 'auth.token.refreshed',
}
```

---

## 7. 에러 처리

### 7.1 에러 코드 정의
```typescript
enum AuthErrorCode {
  INVALID_CREDENTIALS = 'AUTH_SVC_001',
  EMAIL_ALREADY_EXISTS = 'AUTH_SVC_002',
  TOKEN_EXPIRED = 'AUTH_SVC_003',
  TOKEN_INVALID = 'AUTH_SVC_004',
}
```

---

## 8. 테스트 전략

### 8.1 단위 테스트
- 로그인/회원가입 테스트
- 토큰 생성/검증 테스트
- 비밀번호 암호화 테스트

### 8.2 테스트 커버리지 목표
- **단위 테스트**: 90% 이상

---

## 9. 성능 최적화

### 9.1 최적화 기법
- 토큰 검증 결과 캐싱
- 비밀번호 해싱 최적화

---

## 10. 보안 고려사항

### 10.1 인증/인가
- JWT 토큰 사용
- 비밀번호 bcrypt 해싱
- 토큰 만료 시간 설정
- Refresh Token 구현

---

**문서 버전**: 1.0  
**작성일**: 2024-11-19

