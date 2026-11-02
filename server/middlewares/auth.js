import jwt from 'jsonwebtoken';

// 💡 JWT 토큰 검증 미들웨어 (named export)
export const authenticateToken = (req, res, next) => {
  // 1. HTTP 헤더에서 Authorization 값 가져오기 ("Bearer <TOKEN>")
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  // 2. 토큰이 없는 경우 (401 Unauthorized)
  if (!token) {
    return res.status(401).json({ message: '로그인이 필요한 서비스입니다.' });
  }

  // 3. 토큰 유효성 검증
  const secretKey = process.env.JWT_SECRET || 'your_default_jwt_secret';

  jwt.verify(token, secretKey, (err, user) => {
    if (err) {
      // 토큰이 만료되었거나 변조된 경우 (403 Forbidden)
      return res.status(403).json({ message: '유효하지 않거나 만료된 토큰입니다.' });
    }

    // 4. 검증 성공 시 req.user에 사용자 정보(id, email 등)를 담아서 다음 로직으로 전달
    req.user = user;
    next();
  });
};