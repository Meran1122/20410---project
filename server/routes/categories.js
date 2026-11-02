import express from 'express';
import db from '../db.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();

// 카테고리 목록 조회 (공통 기본 카테고리 + 사용자 커스텀 카테고리)
// GET /api/categories
router.get('/', authenticateToken, async (req, res) => {
  const userId = req.user.id || req.user.userId;

  try {
    const [categories] = await db.query(
      `SELECT id, user_id, name, type, icon, color 
       FROM categories 
       WHERE user_id IS NULL OR user_id = ?
       ORDER BY type ASC, id ASC`,
      [userId]
    );

    res.json(categories);
  } catch (error) {
    console.error('카테고리 조회 에러:', error);
    res.status(500).json({ message: '카테고리 목록을 불러오는 중 오류가 발생했습니다.' });
  }
});

// 사용자 커스텀 카테고리 추가
// POST /api/categories
router.post('/', authenticateToken, async (req, res) => {
  const userId = req.user.id || req.user.userId;
  const { name, type, icon, color } = req.body;

  if (!name) {
    return res.status(400).json({ message: '카테고리 이름을 입력해 주세요.' });
  }

  try {
    const [result] = await db.query(
      `INSERT INTO categories (user_id, name, type, icon, color) 
       VALUES (?, ?, ?, ?, ?)`,
      [userId, name, type || 'EXPENSE', icon || '📌', color || '#4DABF7']
    );

    res.status(201).json({
      message: '카테고리가 추가되었습니다.',
      categoryId: result.insertId
    });
  } catch (error) {
    console.error('카테고리 등록 에러:', error);
    res.status(500).json({ message: '카테고리 등록에 실패했습니다.' });
  }
});

export default router;
