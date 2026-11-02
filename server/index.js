import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import usersRouter from './routes/users.js';
import categoriesRouter from './routes/categories.js';
import recurringRouter from './routes/recurring.js';
import transactionsRouter from './routes/transactions.js';
import budgetsRouter from './routes/budgets.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 환경변수 로드
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// 미들웨어 설정
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 기본 상태 확인 엔드포인트
app.get('/', (req, res) => {
  res.send('MoneyPlan Backend Server is running...');
});

// 라우터 등록
app.use('/api/users', usersRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/recurring', recurringRouter);
app.use('/api/transactions', transactionsRouter);
app.use('/api/budgets', budgetsRouter);

// 서버 실행
app.listen(PORT, () => {
  console.log(`🚀 MoneyPlan Server is running on http://localhost:${PORT}`);
});
