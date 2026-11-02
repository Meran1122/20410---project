# 💸 MoneyPlan (머니플랜)
> **20410 서진하** | 데이터베이스 프로그래밍 프로젝트  
> **"미리 보는 나의 잔고, 캘린더 기반 학생 스마트 자산·지출 플래너"**

---

## 📌 1. 기획 배경 및 문제 정의

- **기획 계기**:  
  지난달 무리한 지출로 곤란했던 실제 경험에서 출발했습니다. 학생들은 언제 얼마의 수입(용돈, 알바비)이 들어오는지, 넷플릭스·통신비·교통비 등 매달 주기적으로 나가는 **고정 구독료**가 언제 빠져나가는지, 친구들과의 **약속 예정 지출**이 얼마나 되는지 한눈에 파악하기 어렵습니다.
- **해결책**:  
  1. **월간 캘린더(달력) UI**: 날짜 칸 위에 수입(초록), 고정구독(보라), 약속/예정지출(주황), 완료지출(빨강) 뱃지를 띄워 한눈에 파악.
  2. **정기 구독 매니저**: 매달 결제되는 구독료와 고정비를 등록하고, 매달 캘린더에 자동으로 동기화.
  3. **실시간 스마트 하루 권장 예산 계산기**:  
     $$\text{오늘 권장 사용금액} = \frac{\text{이번 달 예산} - \text{고정비 합계} - \text{예정된 약속 비용}}{\text{남은 일수}}$$
     남은 날 동안 하루에 얼마까지 쓸 수 있는지 실시간으로 안내하여 충동구매와 예산 초과를 방지합니다.

---

## 🛠️ 2. 기술 스택 (Tech Stack)

### Client (프론트엔드)
- **Framework**: React 19, Vite
- **Routing**: React Router DOM v7
- **Styling**: Styled-components
- **Icons**: React Icons
- **HTTP Client**: Axios

### Server (백엔드)
- **Runtime**: Node.js (ES Module)
- **Framework**: Express 5
- **Database**: MySQL 8.0 (`mysql2/promise`)
- **Authentication**: JWT (JSON Web Token), bcrypt
- **Dev Tool**: Nodemon

---

## 🗄️ 3. 데이터베이스(DB) 설계

- **데이터베이스명**: `money_plan_20410`

### 1) 테이블 구조
1. **`users` (사용자)**: 회원 계정 정보, 기본 월 목표 예산 (`default_budget`)
2. **`categories` (카테고리)**: 식비, 구독료, 교통, 쇼핑, 문화 등 수입/지출 분류 (공통 및 커스텀 지원)
3. **`recurring_rules` (정기 수입/지출 규칙)**: 매월 N일 결제되는 정기 항목 (넷플릭스, 통신비 등)
4. **`transactions` (거래/일정 내역 - 캘린더 데이터)**: 날짜별 실제 지출 및 약속 예정 내역 (`status: 'COMPLETED' | 'PLANNED'`)
5. **`monthly_budgets` (월별 예산)**: 연/월별 목표 예산 설정 (`UNIQUE(user_id, year, month)`)

### 2) DB 프로그래밍 평가 포인트
- **외래키(FK) 및 CASCADE 설정**: 사용자가 삭제되거나 카테고리가 삭제될 때 데이터 무결성 보장
- **복합 유니크 제약조건**: 동일 연/월 중복 예산 생성 방지 (`CONSTRAINT uk_user_year_month UNIQUE (user_id, year, month)`)
- **정규화 및 관계 해소**: 정기 반복 규칙(`recurring_rules`)과 실제 일자별 발생 내역(`transactions`) 분리 설계
- **다양한 SQL 집계 쿼리**:
  - 카테고리별 지출 통계: `SUM()`, `COUNT()`, `GROUP BY`
  - 월간 총계: `SUM(CASE WHEN status = 'COMPLETED' THEN amount ELSE 0 END)`
  - 날짜 범위 검색 인덱스 최적화: `INDEX idx_user_date (user_id, transaction_date)`

---

## 🔌 4. 주요 REST API 명세서

| 메서드 | 엔드포인트 | 설명 |
| :--- | :--- | :--- |
| **POST** | `/api/users/signup` | 회원가입 및 기본 예산 설정 |
| **POST** | `/api/users/login` | 로그인 (JWT 토큰 발급) |
| **GET** | `/api/users/me` | 내 프로필 및 기본 예산 조회 |
| **GET** | `/api/categories` | 수입/지출 카테고리 목록 조회 |
| **GET** | `/api/transactions` | 특정 월(연/월) 캘린더 거래 및 일정 내역 + 요약 통계 |
| **POST** | `/api/transactions` | 새 지출/수입/약속 일정 등록 |
| **PATCH** | `/api/transactions/:id/status` | 지출 완료 ↔ 약속 예정 상태 토글 |
| **DELETE** | `/api/transactions/:id` | 거래 내역 삭제 |
| **GET** | `/api/recurring` | 정기 구독 및 고정 수입/지출 목록 조회 |
| **POST** | `/api/recurring` | 새 정기 항목 등록 (매월 N일) |
| **POST** | `/api/recurring/sync` | 활성화된 정기 항목을 해당 월 캘린더에 자동 생성 |
| **GET** | `/api/budgets` | 해당 월 목표 예산, 남은 예산, 하루 권장 지출액 계산 조회 |
| **POST** | `/api/budgets` | 해당 월 목표 예산 설정 및 수정 |

---

## 🚀 5. 실행 방법

### 1) MySQL 데이터베이스 초기화
MySQL 콘솔 또는 Workbench에서 `schema.sql` 스크립트를 실행합니다:
```bash
mysql -u root -p < schema.sql
```
그 후 `server/.env` 파일의 `DB_PASSWORD`를 본인의 MySQL 비밀번호로 설정합니다.

### 2) 서버(Server) 실행
```bash
cd server
npm run dev
# http://localhost:5000 실행
```

### 3) 클라이언트(Client) 실행
```bash
cd client
npm run dev
# http://localhost:5173 실행
```
