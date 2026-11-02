import express from 'express';
import db from '../db.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();

// 1. 정기 수입/지출 목록 조회
// GET /api/recurring
router.get('/', authenticateToken, async (req, res) => {
  const userId = req.user.id || req.user.userId;

  try {
    const [rules] = await db.query(
      `SELECT r.*, c.name AS category_name, c.icon AS category_icon, c.color AS category_color
       FROM recurring_rules r
       JOIN categories c ON r.category_id = c.id
       WHERE r.user_id = ?
       ORDER BY r.day_of_month ASC, r.id ASC`,
      [userId]
    );

    res.json(rules);
  } catch (error) {
    console.error('정기 항목 조회 에러:', error);
    res.status(500).json({ message: '정기 항목을 불러오는 중 오류가 발생했습니다.' });
  }
});

// 2. 새 정기 항목 등록
// POST /api/recurring
router.post('/', authenticateToken, async (req, res) => {
  const userId = req.user.id || req.user.userId;
  const { category_id, name, amount, type, day_of_month, memo } = req.body;

  if (!category_id || !name || !amount || !day_of_month) {
    return res.status(400).json({ message: '필수 항목(카테고리, 이름, 금액, 일자)을 입력해 주세요.' });
  }

  const day = parseInt(day_of_month, 10);
  if (day < 1 || day > 31) {
    return res.status(400).json({ message: '일자는 1일에서 31일 사이여야 합니다.' });
  }

  try {
    const [result] = await db.query(
      `INSERT INTO recurring_rules (user_id, category_id, name, amount, type, day_of_month, memo)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, category_id, name, amount, type || 'EXPENSE', day, memo || null]
    );

    res.status(201).json({
      message: '정기 항목이 등록되었습니다.',
      recurringId: result.insertId
    });
  } catch (error) {
    console.error('정기 항목 등록 에러:', error);
    res.status(500).json({ message: '정기 항목 등록에 실패했습니다.' });
  }
});

// 3. 정기 항목 수정
// PUT /api/recurring/:id
router.put('/:id', authenticateToken, async (req, res) => {
  const userId = req.user.id || req.user.userId;
  const { id } = req.params;
  const { category_id, name, amount, type, day_of_month, is_active, memo } = req.body;

  try {
    const [result] = await db.query(
      `UPDATE recurring_rules 
       SET category_id = ?, name = ?, amount = ?, type = ?, day_of_month = ?, is_active = ?, memo = ?
       WHERE id = ? AND user_id = ?`,
      [category_id, name, amount, type, day_of_month, is_active, memo, id, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: '항목을 찾을 수 없거나 권한이 없습니다.' });
    }

    res.json({ message: '정기 항목이 수정되었습니다.' });
  } catch (error) {
    console.error('정기 항목 수정 에러:', error);
    res.status(500).json({ message: '정기 항목 수정에 실패했습니다.' });
  }
});

// 4. 정기 항목 삭제
// DELETE /api/recurring/:id
router.delete('/:id', authenticateToken, async (req, res) => {
  const userId = req.user.id || req.user.userId;
  const { id } = req.params;

  try {
    const [result] = await db.query(
      'DELETE FROM recurring_rules WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: '항목을 찾을 수 없거나 권한이 없습니다.' });
    }

    res.json({ message: '정기 항목이 삭제되었습니다.' });
  } catch (error) {
    console.error('정기 항목 삭제 에러:', error);
    res.status(500).json({ message: '정기 항목 삭제에 실패했습니다.' });
  }
});

// 5. 특정 월로 정기 항목 자동 동기화(캘린더 생성)
// POST /api/recurring/sync
router.post('/sync', authenticateToken, async (req, res) => {
  const userId = req.user.id || req.user.userId;
  const { year, month } = req.body; // 예: 2026, 11

  if (!year || !month) {
    return res.status(400).json({ message: '연도와 월을 입력해 주세요.' });
  }

  try {
    // 1) 활성화된 정기 규칙 조회
    const [rules] = await db.query(
      'SELECT * FROM recurring_rules WHERE user_id = ? AND is_active = TRUE',
      [userId]
    );

    // 2) 해당 월에 이미 생성된 recurring_id 목록 조회
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    const [existing] = await db.query(
      `SELECT recurring_id FROM transactions 
       WHERE user_id = ? AND recurring_id IS NOT NULL 
       AND transaction_date BETWEEN ? AND ?`,
      [userId, startDate, endDate]
    );

    const existingRecurringIds = new Set(existing.map((row) => row.recurring_id));
    let insertedCount = 0;

    for (const rule of rules) {
      if (!existingRecurringIds.has(rule.id)) {
        // 일자가 월의 말일보다 큰 경우 말일로 조정 (예: 2월 30일 -> 2월 28/29일)
        const targetDay = Math.min(rule.day_of_month, lastDay);
        const targetDate = `${year}-${String(month).padStart(2, '0')}-${String(targetDay).padStart(2, '0')}`;

        await db.query(
          `INSERT INTO transactions (user_id, category_id, recurring_id, transaction_date, amount, type, status, title, memo)
           VALUES (?, ?, ?, ?, ?, ?, 'PLANNED', ?, ?)`,
          [userId, rule.category_id, rule.id, targetDate, rule.amount, rule.type, rule.name, rule.memo]
        );
        insertedCount++;
      }
    }

    res.json({
      message: `${insertedCount}개의 정기 항목이 ${year}년 ${month}월 캘린더에 동기화되었습니다.`,
      insertedCount
    });
  } catch (error) {
    console.error('정기 항목 동기화 에러:', error);
    res.status(500).json({ message: '정기 항목 동기화 중 오류가 발생했습니다.' });
  }
});

export default router;
