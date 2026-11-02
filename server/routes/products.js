import express from 'express';
import db from '../db.js';

const router = express.Router();

// 1. 전체 상품 목록 조회 (비로그인 사용자도 가능)
// GET /api/products
router.get('/', async (req, res) => {
  const { category } = req.query; // 카테고리 필터링 쿼리 파라미터

  try {
    let query = `
      SELECT p.id, p.title, p.price, p.type, p.category, p.status, p.location, p.image_url, p.created_at, u.nickname AS seller_nickname
      FROM products p
      JOIN users u ON (p.seller_id = u.id)
    `;
    const params = [];

    if (category && category !== '전체') {
      query += ' WHERE p.category = ?';
      params.push(category);
    }

    query += ' ORDER BY p.created_at DESC';

    const [products] = await db.query(query, params);
    return res.status(200).json(products);
  } catch (error) {
    console.error('상품 목록 조회 에러:', error);
    return res.status(500).json({ message: '서버 에러가 발생했습니다.' });
  }
});

// 2. 단일 상품 상세 조회 (비로그인 사용자도 가능)
// GET /api/products/:id
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await db.query(
      `SELECT p.*, u.nickname AS seller_nickname, u.student_id AS seller_student_id
       FROM products p
       JOIN users u ON (p.seller_id = u.id)
       WHERE p.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: '존재하지 않는 상품입니다.' });
    }

    return res.status(200).json(rows[0]);
  } catch (error) {
    console.error('상품 상세 조회 에러:', error);
    return res.status(500).json({ message: '서버 에러가 발생했습니다.' });
  }
});

// 3. 새 상품 등록 (로그인 회원 전용 - 작성 시 seller_id 외래키 연결)
// POST /api/products
router.post('/', async (req, res) => {
  const { seller_id, user_id, title, description, price, type, category, location, image_url } = req.body;
  const authorId = seller_id || user_id;

  if (!authorId || !title || !category || !location) {
    return res.status(400).json({ message: '필수 상품 정보를 입력해 주세요.' });
  }

  // 무료나눔(FREE) 선택 시 price는 0으로 강제 세팅
  const finalPrice = type === 'FREE' ? 0 : (price || 0);

  try {
    const [result] = await db.query(
      `INSERT INTO products (seller_id, title, description, price, type, category, location, image_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [authorId, title, description || '', finalPrice, type || 'SELL', category, location, image_url || null]
    );

    return res.status(201).json({
      message: '상품이 성공적으로 등록되었습니다.',
      productId: result.insertId
    });
  } catch (error) {
    console.error('상품 등록 에러:', error);
    return res.status(500).json({ message: '서버 에러가 발생했습니다.' });
  }
});

// 4. 상품 상태 변경 (판매중 / 예약중 / 거래완료)
// PATCH /api/products/:id/status
router.patch('/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // 'SELLING', 'RESERVED', 'COMPLETED'

  if (!['SELLING', 'RESERVED', 'COMPLETED'].includes(status)) {
    return res.status(400).json({ message: '유효한 거래 상태값이 아닙니다.' });
  }

  try {
    await db.query('UPDATE products SET status = ? WHERE id = ?', [status, id]);
    res.json({ message: '거래 상태가 변경되었습니다.' });
  } catch (error) {
    console.error('상태 변경 에러:', error);
    res.status(500).json({ message: '서버 에러가 발생했습니다.' });
  }
});

// 5. 상품 삭제
// DELETE /api/products/:id
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.query('DELETE FROM products WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: '삭제할 상품을 찾을 수 없습니다.' });
    }
    res.json({ message: '상품이 성공적으로 삭제되었습니다.' });
  } catch (error) {
    console.error('상품 삭제 에러:', error);
    res.status(500).json({ message: '서버 에러가 발생했습니다.' });
  }
});

export default router;
