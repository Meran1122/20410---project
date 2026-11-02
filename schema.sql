-- ===================================================
-- MoneyPlan (머니플랜) - 20410 서진하
-- 캘린더 기반 학생 스마트 자산·지출 플래너 데이터베이스 스키마
-- ===================================================

CREATE DATABASE IF NOT EXISTS money_plan_20410 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE money_plan_20410;

-- 1. 사용자(users) 테이블
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  nickname VARCHAR(50) NOT NULL,
  phone_number VARCHAR(20) NOT NULL UNIQUE,
  entry_year INT NOT NULL,                          -- 입학년도 (예: 2026)
  student_id VARCHAR(10) NOT NULL,                  -- 학번 (예: "20410")
  default_budget INT NOT NULL DEFAULT 300000,       -- 기본 한 달 목표 예산 (기본값: 30만원)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uk_entry_student UNIQUE (entry_year, student_id)
);

-- 2. 카테고리(categories) 테이블
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,                                 -- NULL이면 전체 사용자 공통 카테고리, 값이 있으면 사용자 커스텀
  name VARCHAR(50) NOT NULL,                        -- 카테고리명 (식비, 구독료 등)
  type VARCHAR(10) NOT NULL DEFAULT 'EXPENSE',      -- 'INCOME'(수입) 또는 'EXPENSE'(지출)
  icon VARCHAR(20) DEFAULT '📌',                     -- 이모지 아이콘
  color VARCHAR(20) DEFAULT '#4DABF7',              -- 뱃지 색상 코드
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. 정기 수입/지출 규칙(recurring_rules) 테이블
CREATE TABLE IF NOT EXISTS recurring_rules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,                             -- 사용자 ID
  category_id INT NOT NULL,                         -- 카테고리 ID
  name VARCHAR(100) NOT NULL,                       -- 항목명 (넷플릭스, 통신비, 용돈 등)
  amount INT NOT NULL DEFAULT 0,                    -- 금액
  type VARCHAR(10) NOT NULL DEFAULT 'EXPENSE',      -- 'INCOME' or 'EXPENSE'
  day_of_month INT NOT NULL,                        -- 매월 결제/입금 일자 (1 ~ 31)
  is_active BOOLEAN NOT NULL DEFAULT TRUE,          -- 활성화 여부
  memo VARCHAR(255),                                -- 메모
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- 4. 거래/일정 내역(transactions) 테이블 (캘린더의 핵심 데이터)
CREATE TABLE IF NOT EXISTS transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,                             -- 사용자 ID
  category_id INT NOT NULL,                         -- 카테고리 ID
  recurring_id INT NULL,                            -- 정기 규칙으로 자동 생성된 경우 해당 ID (수기 등록 시 NULL)
  transaction_date DATE NOT NULL,                   -- 거래 및 예정 날짜
  amount INT NOT NULL DEFAULT 0,                    -- 금액
  type VARCHAR(10) NOT NULL DEFAULT 'EXPENSE',      -- 'INCOME' or 'EXPENSE'
  status VARCHAR(20) NOT NULL DEFAULT 'COMPLETED',  -- 'COMPLETED'(실제발생/완료) or 'PLANNED'(약속/예정)
  title VARCHAR(150) NOT NULL,                      -- 항목 제목 (예: "친구 생일파티", "점심 편의점")
  memo TEXT,                                        -- 상세 메모
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
  FOREIGN KEY (recurring_id) REFERENCES recurring_rules(id) ON DELETE SET NULL,
  INDEX idx_user_date (user_id, transaction_date)
);

-- 5. 월별 예산(monthly_budgets) 테이블
CREATE TABLE IF NOT EXISTS monthly_budgets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,                             -- 사용자 ID
  year INT NOT NULL,                                -- 연도 (예: 2026)
  month INT NOT NULL,                               -- 월 (예: 11)
  target_budget INT NOT NULL DEFAULT 300000,        -- 해당 월 목표 예산
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT uk_user_year_month UNIQUE (user_id, year, month)
);

-- ===================================================
-- 기본 공통 카테고리 초기 데이터 삽입
-- ===================================================
INSERT INTO categories (user_id, name, type, icon, color) VALUES
  (NULL, '식비/카페', 'EXPENSE', '🍔', '#FF6B6B'),
  (NULL, '정기구독/고정비', 'EXPENSE', '📱', '#845EF7'),
  (NULL, '교통비', 'EXPENSE', '🚌', '#4DABF7'),
  (NULL, '쇼핑/생필품', 'EXPENSE', '🛍️', '#FCC419'),
  (NULL, '문화/약속', 'EXPENSE', '🎬', '#FF922B'),
  (NULL, '기타 지출', 'EXPENSE', '💸', '#868E96'),
  (NULL, '용돈', 'INCOME', '💵', '#51CF66'),
  (NULL, '알바비/급여', 'INCOME', '💼', '#20C997'),
  (NULL, '기타 수입', 'INCOME', '💰', '#339AF0')
ON DUPLICATE KEY UPDATE name=name;
