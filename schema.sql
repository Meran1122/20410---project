-- ===================================================
-- school_market_20410 데이터베이스 및 테이블 생성 스크립트
-- ===================================================

CREATE DATABASE IF NOT EXISTS school_market_20410 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE school_market_20410;

-- 1. 사용자(users) 테이블
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  nickname VARCHAR(50) NOT NULL,
  phone_number VARCHAR(20) NOT NULL UNIQUE,
  entry_year INT NOT NULL,            -- 입학년도 (예: 2026)
  student_id VARCHAR(10) NOT NULL,    -- 학번 (예: "20410")
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uk_entry_student UNIQUE (entry_year, student_id)
);

-- 2. 물품(products) 테이블
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,          -- 물품 고유 ID
  title VARCHAR(150) NOT NULL,                 -- 글 제목
  description TEXT NOT NULL,                   -- 상세 설명
  price INT NOT NULL DEFAULT 0,                -- 가격 (나눔일 경우 0)
  type VARCHAR(10) NOT NULL DEFAULT 'SELL',    -- 거래 유형 ('SELL': 판매, 'FREE': 나눔)
  category VARCHAR(50) NOT NULL,               -- 카테고리 ('서적', '교복', '학용품', '기타')
  status VARCHAR(20) NOT NULL DEFAULT 'SELLING',-- 거래 상태 ('SELLING': 판매중, 'RESERVED': 예약중, 'COMPLETED': 거래완료)
  location VARCHAR(100) NOT NULL,              -- 교내 거래 장소 ('1층 중앙현관', '체육관앞' 등)
  image_url VARCHAR(255),                      -- 상품 이미지 경로/URL
  seller_id INT NOT NULL,                      -- 판매자 ID (users 테이블 참조)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- 게시글 등록일자
  
  -- 외래키 설정: 작성자가 삭제되면 작성글 처리 방침 설정 (CASCADE)
  FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE
);
