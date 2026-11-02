import express from 'express';
import db from '../db.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();

// 1. 특정 월의 거래/일정 목록 및 통계 요약 조회
// GET /api/transactions?year=2026&month=11
router.get('/', authenticateToken, async (req, res) => {
  const userId = req.user.id || req.user.userId;
  const year = parseInt(req.query.year, 10) || new Date().getFullYear();
  const month = parseInt(req.query.month, 10) || (new Date().getMonth() + 1);

  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

  try {
    // 1) 해당 월의 모든 거래 내역 조회
    const [transactions] = await db.query(
      `SELECT t.*, 
              DATE_FORMAT(t.transaction_date, '%Y-%m-%d') AS transaction_date,
              c.name AS category_name, c.icon AS category_icon, c.color AS category_color,
              r.name AS recurring_name
       FROM transactions t
       JOIN categories c ON t.category_id = c.id
       LEFT JOIN recurring_rules r ON t.recurring_id = r.id
       WHERE t.user_id = ? AND t.transaction_date BETWEEN ? AND ?
       ORDER BY t.transaction_date ASC, t.id ASC`,
      [userId, startDate, endDate]
    );

    // 2) 카테고리별 지출 통계 집계 (GROUP BY 쿼리)
    const [categoryStats] = await db.query(
      `SELECT c.id, c.name, c.icon, c.color, 
              SUM(t.amount) AS total_amount,
              COUNT(t.id) AS count
       FROM transactions t
       JOIN categories c ON t.category_id = c.id
       WHERE t.user_id = ? AND t.type = 'EXPENSE' AND t.transaction_date BETWEEN ? AND ?
       GROUP BY c.id, c.name, c.icon, c.color
       ORDER BY total_amount DESC`,
      [userId, startDate, endDate]
    );

    // 3) 전체 수입, 지출(완료), 예정 지출(계획) 계산
    let totalIncome = 0;
    let totalExpense = 0;
    let totalPlannedExpense = 0;

    for (const item of transactions) {
      if (item.type === 'INCOME') {
        totalIncome += item.amount;
      } else {
        if (item.status === 'COMPLETED') {
          totalExpense += item.amount;
        } else {
          totalPlannedExpense += item.amount;
        }
      }
    }

    res.json({
      year,
      month,
      transactions,
      summary: {
        totalIncome,
        totalExpense,
        totalPlannedExpense,
        totalAllExpense: totalExpense + totalPlannedExpense,
        balance: totalIncome - (totalExpense + totalPlannedExpense)
      },
      categoryStats
    });
  } catch (error) {
    console.error('거래 내역 조회 에러:', error);
    res.status(500).json({ message: '거래 내역을 불러오는 중 오류가 발생했습니다.' });
  }
});

// 2. 새 거래/약속 일정 등록
// POST /api/transactions
router.post('/', authenticateToken, async (req, res) => {
  const userId = req.user.id || req.user.userId;
  const { category_id, transaction_date, amount, type, status, title, memo } = req.body;

  if (!category_id || !transaction_date || !amount || !title) {
    return res.status(400).json({ message: '필수 항목(날짜, 카테고리, 제목, 금액)을 입력해 주세요.' });
  }

  try {
    const [result] = await db.query(
      `INSERT INTO transactions (user_id, category_id, transaction_date, amount, type, status, title, memo)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        category_id,
        transaction_date,
        amount,
        type || 'EXPENSE',
        status || 'COMPLETED',
        title,
        memo || null
      ]
    );

    res.status(201).json({
      message: '항목이 성공적으로 등록되었습니다.',
      transactionId: result.insertId
    });
  } catch (error) {
    console.error('거래 등록 에러:', error);
    res.status(500).json({ message: '거래 등록에 실패했습니다.' });
  }
});

// 3. 거래/일정 수정
// PUT /api/transactions/:id
router.put('/:id', authenticateToken, async (req, res) => {
  const userId = req.user.id || req.user.userId;
  const { id } = req.params;
  const { category_id, transaction_date, amount, type, status, title, memo } = req.body;

  try {
    const [result] = await db.query(
      `UPDATE transactions
       SET category_id = ?, transaction_date = ?, amount = ?, type = ?, status = ?, title = ?, memo = ?
       WHERE id = ? AND user_id = ?`,
      [category_id, transaction_date, amount, type, status, title, memo, id, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: '항목을 찾을 수 없거나 수정 권한이 없습니다.' });
    }

    res.json({ message: '항목이 수정되었습니다.' });
  } catch (error) {
    console.error('거래 수정 에러:', error);
    res.status(500).json({ message: '거래 수정에 실패했습니다.' });
  }
});

// 4. 상태 변경 (예정 <-> 완료 토글)
// PATCH /api/transactions/:id/status
router.patch('/:id/status', authenticateToken, async (req, res) => {
  const userId = req.user.id || req.user.userId;
  const { id } = req.params;
  const { status } = req.body; // 'COMPLETED' or 'PLANNED'

  if (!['COMPLETED', 'PLANNED'].includes(status)) {
    return res.status(400).json({ message: '올바른 상태값이 아닙니다.' });
  }

  try {
    const [result] = await db.query(
      'UPDATE transactions SET status = ? WHERE id = ? AND user_id = ?',
      [status, id, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: '항목을 찾을 수 없거나 권한이 없습니다.' });
    }

    res.json({ message: '상태가 변경되었습니다.', status });
  } catch (error) {
    console.error('상태 변경 에러:', error);
    res.status(500).json({ message: '상태 변경에 실패했습니다.' });
  }
});

// 5. 거래/일정 삭제
// DELETE /api/transactions/:id
router.delete('/:id', authenticateToken, async (req, res) => {
  const userId = req.user.id || req.user.userId;
  const { id } = req.params;

  try {
    const [result] = await db.query(
      'DELETE FROM transactions WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: '항목을 찾을 수 없거나 삭제 권한이 없습니다.' });
    }

    res.json({ message: '항목이 삭제되었습니다.' });
  } catch (error) {
    console.error('거래 삭제 에러:', error);
    res.status(500).json({ message: '거래 삭제에 실패했습니다.' });
  }
});

export default router;
