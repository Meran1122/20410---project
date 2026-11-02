import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from '../db.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();

// 1. 회원가입 API
// POST /api/users/signup
router.post('/signup', async (req, res) => {
  const { email, password, nickname, phone_number, entry_year, student_id, default_budget } = req.body;

  if (!email || !password || !nickname || !phone_number || !entry_year || !student_id) {
    return res.status(400).json({ message: '모든 필수 정보를 입력해 주세요.' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const initialBudget = default_budget ? parseInt(default_budget, 10) : 300000;

    const [result] = await db.query(
      `INSERT INTO users (email, password, nickname, phone_number, entry_year, student_id, default_budget) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [email, hashedPassword, nickname, phone_number, entry_year, student_id, initialBudget]
    );

    const userId = result.insertId;
    const token = jwt.sign(
      { userId, email, nickname },
      process.env.JWT_SECRET || 'fallback_secret_key',
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      message: '회원가입이 완료되었습니다.',
      token,
      user: { id: userId, email, nickname, default_budget: initialBudget }
    });

  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: '이미 등록된 회원 정보(이메일/전화번호/학번)입니다.' });
    }
    console.error('회원가입 에러:', error);
    return res.status(500).json({ message: '서버 에러가 발생했습니다.' });
  }
});

// 2. 로그인 API
// POST /api/users/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: '이메일과 비밀번호를 입력해 주세요.' });
  }

  try {
    const [rows] = await db.query(
      'SELECT id, email, password, nickname, default_budget FROM users WHERE email = ?',
      [email]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: '등록된 회원 정보가 없습니다.' });
    }

    const [user] = rows;
    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return res.status(401).json({ message: '비밀번호가 일치하지 않습니다.' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, nickname: user.nickname },
      process.env.JWT_SECRET || 'fallback_secret_key',
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      message: '로그인 성공',
      token,
      user: { id: user.id, email: user.email, nickname: user.nickname, default_budget: user.default_budget }
    });
  } catch (error) {
    console.error('로그인 에러:', error);
    return res.status(500).json({ message: '서버 에러가 발생했습니다.' });
  }
});

// 3. 내 프로필 정보 조회 (GET /api/users/me)
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId;

    if (!userId) {
      return res.status(400).json({ message: '토큰에서 사용자 ID를 찾을 수 없습니다.' });
    }

    const [rows] = await db.query(
      'SELECT id, email, nickname, phone_number, entry_year, student_id, default_budget FROM users WHERE id = ?',
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('GET /api/users/me 에러:', error);
    res.status(500).json({ message: '서버 내부 오류가 발생했습니다.' });
  }
});

// 4. 프로필 및 기본 예산 정보 수정 (PUT /api/users/me)
router.put('/me', authenticateToken, async (req, res) => {
  const { currentPassword, nickname, phone_number, entry_year, student_id, default_budget } = req.body;
  const userId = req.user.id || req.user.userId;

  try {
    const [users] = await db.query('SELECT password FROM users WHERE id = ?', [userId]);
    if (users.length === 0) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    // 비밀번호 검증 (변경 시)
    if (currentPassword) {
      const isPasswordValid = await bcrypt.compare(currentPassword, users[0].password);
      if (!isPasswordValid) {
        return res.status(400).json({ message: '현재 비밀번호가 일치하지 않습니다.' });
      }
    }

    await db.query(
      `UPDATE users 
       SET nickname = COALESCE(?, nickname), 
           phone_number = COALESCE(?, phone_number), 
           entry_year = COALESCE(?, entry_year), 
           student_id = COALESCE(?, student_id),
           default_budget = COALESCE(?, default_budget)
       WHERE id = ?`,
      [nickname, phone_number, entry_year, student_id, default_budget, userId]
    );

    res.json({ message: '프로필 및 예산 설정이 수정되었습니다.' });
  } catch (error) {
    console.error('PUT /api/users/me 에러:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

export default router;
