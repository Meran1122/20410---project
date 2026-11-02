import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from '../db.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();

// 1. 회원가입 API (가입 성공 시 자동 로그인을 위한 토큰 즉시 반환)
// POST /api/users/signup
router.post('/signup', async (req, res) => {
  const { email, password, nickname, phone_number, entry_year, student_id } = req.body;

  if (!email || !password || !nickname || !phone_number || !entry_year || !student_id) {
    return res.status(400).json({ message: '모든 필수 정보를 입력해 주세요.' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.query(
      `INSERT INTO users (email, password, nickname, phone_number, entry_year, student_id) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [email, hashedPassword, nickname, phone_number, entry_year, student_id]
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
      user: { id: userId, email, nickname }
    });

  } catch (error) {
    // 복합 유니크(uk_entry_student) 또는 이메일/전화번호 중복 시 예외 처리
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
      'SELECT id, email, password, nickname FROM users WHERE email = ?',
      [email]
    );

    // 회원이 아닌 경우 (404 상태코드 -> 프론트에서 회원가입 이동 유도)
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
      user: { id: user.id, email: user.email, nickname: user.nickname }
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
      'SELECT id, email, nickname, phone_number, entry_year, student_id FROM users WHERE id = ?',
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('GET /api/users/me 500 에러 원인:', error);
    res.status(500).json({ message: '서버 내부 오류가 발생했습니다.', error: error.message });
  }
});

// 4. 프로필 정보 수정 (PUT /api/users/me)
router.put('/me', authenticateToken, async (req, res) => {
  const { currentPassword, nickname, phone_number, entry_year, student_id } = req.body;
  const userId = req.user.id || req.user.userId;

  try {
    const [users] = await db.query('SELECT password FROM users WHERE id = ?', [userId]);
    if (users.length === 0) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, users[0].password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: '현재 비밀번호가 일치하지 않습니다.' });
    }

    await db.query(
      'UPDATE users SET nickname = ?, phone_number = ?, entry_year = ?, student_id = ? WHERE id = ?',
      [nickname, phone_number, entry_year, student_id, userId]
    );

    res.json({ message: '프로필 정보가 수정되었습니다.' });
  } catch (error) {
    console.error('PUT /api/users/me 500 에러 원인:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.', error: error.message });
  }
});

export default router;
