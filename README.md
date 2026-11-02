# 🏫 school_market (20410 서진하 프로젝트)

교내 학생들을 위한 안전하고 편리한 중고물품 거래 & 나눔 웹 서비스입니다.

---

## 🛠️ 기술 스택 (Tech Stack)

### Client (프론트엔드)
- **Framework / Bundler**: React 19, Vite
- **Routing**: React Router DOM v7
- **Styling**: Styled-components
- **Icons**: React Icons
- **HTTP Client**: Axios

### Server (백엔드)
- **Runtime**: Node.js (ES Module)
- **Framework**: Express 5
- **Database**: MySQL 8.0 (`mysql2/promise`)
- **Authentication**: JWT (JSON Web Token), bcrypt
- **File Upload**: Multer
- **Dev Tool**: Nodemon

---

## 📁 프로젝트 폴더 구조

```text
20410-project/
├── client/                     # 프론트엔드 (React + Vite)
│   ├── public/
│   │   ├── images/             # 디자인 이미지
│   │   └── ...
│   ├── src/
│   │   ├── components/         # Header, Footer 등 공통 컴포넌트
│   │   ├── pages/              # Home, Login, Signup 등 페이지 컴포넌트
│   │   ├── App.jsx             # 라우팅 설정
│   │   ├── Layout.jsx          # 공통 레이아웃
│   │   ├── index.css           # 초기화 CSS
│   │   └── main.jsx            # 엔트리 포인트 (BrowserRouter 감싸기)
│   ├── package.json
│   └── vite.config.js          # /api 프록시 설정
│
├── server/                     # 백엔드 (Node.js + Express)
│   ├── middlewares/            # JWT 인증 등 미들웨어
│   ├── routes/                 # users, products 라우터
│   ├── uploads/                # 업로드된 이미지 저장 경로
│   ├── .env                    # 환경변수 설정 (DB 및 포트)
│   ├── .env.example
│   ├── db.js                   # MySQL 커넥션 풀
│   ├── index.js                # 서버 엔트리 포인트
│   └── package.json
│
├── .gitignore
├── README.md
└── schema.sql                  # MySQL 데이터베이스 스키마
```

---

## 🚀 실행 방법

### 1. 데이터베이스(MySQL) 설정
MySQL 워크벤치나 콘솔에서 `schema.sql`을 실행하여 DB와 테이블을 생성합니다:
```bash
mysql -u root -p < schema.sql
```
그리고 `server/.env` 파일의 DB 비밀번호(`DB_PASSWORD`)를 본인 MySQL 비밀번호로 수정합니다.

### 2. 백엔드(Server) 실행
```bash
cd server
npm run dev    # 또는 npm start
# http://localhost:5000 실행
```

### 3. 프론트엔드(Client) 실행
```bash
cd client
npm run dev
# http://localhost:5173 실행
```
