import express from 'express';
import db from '../db.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();

// 1. 해당 월의 예산 정보 및 하루 권장 지출액 조회
// GET /api/budgets?year=2026&month=11
router.get('/', authenticateToken, async (req, res) => {
  const userId = req.user.id || req.user.userId;
  const now = new Date();
  const year = parseInt(req.query.year, 10) || now.getFullYear();
  const month = parseInt(req.query.month, 10) || (now.getMonth() + 1);

  try {
    // 1) 유저 기본 예산 조회
    const [userRows] = await db.query(
      'SELECT default_budget FROM users WHERE id = ?',
      [userId]
    );
    const defaultBudget = userRows.length > 0 ? userRows[0].default_budget : 300000;

    // 2) 해당 월 설정 예산 조회
    const [budgetRows] = await db.query(
      'SELECT target_budget FROM monthly_budgets WHERE user_id = ? AND year = ? AND month = ?',
      [userId, year, month]
    );
    const targetBudget = budgetRows.length > 0 ? budgetRows[0].target_budget : defaultBudget;

    // 3) 해당 월의 지출 내역 합계 조회
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    const [expenseRows] = await db.query(
      `SELECT 
        SUM(CASE WHEN status = 'COMPLETED' THEN amount ELSE 0 END) AS spent_amount,
        SUM(CASE WHEN status = 'PLANNED' THEN amount ELSE 0 END) AS planned_amount
       FROM transactions
       WHERE user_id = ? AND type = 'EXPENSE' AND transaction_date BETWEEN ? AND ?`,
      [userId, startDate, endDate]
    );

    const spentAmount = parseInt(expenseRows[0].spent_amount, 10) || 0;
    const plannedAmount = parseInt(expenseRows[0].planned_amount, 10) || 0;
    const totalExpectedExpense = spentAmount + plannedAmount;
    const remainingBudget = targetBudget - totalExpectedExpense;

    // 4) 오늘 기준 남은 일수 계산
    let remainingDays = 1;
    const isCurrentMonth = (year === now.getFullYear() && month === (now.getMonth() + 1));

    if (isCurrentMonth) {
      const todayDate = now.getDate();
      remainingDays = Math.max(1, lastDay - todayDate + 1);
    } else if (year > now.getFullYear() || (year === now.getFullYear() && month > (now.getMonth() + 1))) {
      remainingDays = lastDay; // 미래 월
    } else {
      remainingDays = 1; // 과거 월
    }

    // 하루 권장 사용 금액
    const dailyRecommendedBudget = Math.max(0, Math.floor(remainingBudget / remainingDays));

    res.json({
      year,
      month,
      targetBudget,
      spentAmount,
      plannedAmount,
      totalExpectedExpense,
      remainingBudget,
      remainingDays,
      dailyRecommendedBudget,
      usagePercent: targetBudget > 0 ? Math.round((totalExpectedExpense / targetBudget) * 100) : 0
    });
  } catch (error) {
    console.error('예산 조회 에러:', error);
    res.status(500).json({ message: '예산 정보를 불러오는 중 오류가 발생했습니다.' });
  }
});

// 2. 해당 월 목표 예산 설정/수정
// POST /api/budgets
router.post('/', authenticateToken, async (req, res) => {
  const userId = req.user.id || req.user.userId;
  const { year, month, target_budget } = req.body;

  if (!year || !month || target_budget === undefined) {
    return res.status(400).json({ message: '연도, 월, 목표 예산을 입력해 주세요.' });
  }

  try {
    await db.query(
      `INSERT INTO monthly_budgets (user_id, year, month, target_budget)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE target_budget = VALUES(target_budget)`,
      [userId, year, month, target_budget]
    );

    res.json({ message: '목표 예산이 설정되었습니다.', targetBudget: target_budget });
  } catch (error) {
    console.error('예산 설정 에러:', error);
    res.status(500).json({ message: '예산 설정에 실패했습니다.' });
  }
});

export default router;
